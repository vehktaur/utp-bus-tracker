import {
  distanceMeters,
  median,
  pointAtDistance,
  projectOntoRoute,
} from './geo';
import { scheduledDistance } from './schedule';
import type { RouteGeometry } from './geo';
import type {
  BusEstimate,
  BusRoute,
  DeviceState,
  LiveFix,
  LocationPing,
  TripWindow,
} from '~/types';

export const TRACKING_CONFIG = {
  /** A phone that hasn't reported in this long is ignored. */
  staleAfterMs: 30_000,
  /** Fixes with a worse accuracy radius than this are ignored. */
  maxAccuracyM: 100,
  /** Further than this from the route line means not on the bus. */
  maxOffRouteM: 60,
  /** Sustained walking pace over this window, away from a stop, means the person got off. */
  walkingWindowMs: 90_000,
  walkingSpeedMps: { min: 0.4, max: 2.5 },
  /** Barely moving for this long means the phone was left behind (e.g. at a stop). */
  stationaryWindowMs: 240_000,
  stationaryRadiusM: 25,
  stopRadiusM: 50,
  /** Phones further apart than this along the route can't be on the same bus. */
  clusterGapM: 250,
  speedWindowMs: 30_000,
  /** After sharing stops, keep extrapolating from the last fix for this long. */
  recentWindowMs: 180_000,
  /** Weight an on-board driver above riders when the two disagree. */
  driverWeight: 3,
} as const;

interface Classified extends DeviceState {
  speedMps: number | null;
}

const kmhToMps = (kmh: number) => kmh / 3.6;

const windowFrom = (pings: LocationPing[], sinceMs: number) =>
  pings.filter((ping) => ping.timestamp >= sinceMs);

const isNearStop = (geometry: RouteGeometry, distanceAlong: number) =>
  geometry.stopDistances.some(
    (stopDistance) =>
      Math.abs(stopDistance - distanceAlong) < TRACKING_CONFIG.stopRadiusM,
  );

/** Decides whether a single phone's recent pings look like they're on the bus. */
export const classifyDevice = (
  geometry: RouteGeometry,
  pings: LocationPing[],
  now: number,
): Classified => {
  const latest = pings[pings.length - 1];
  const base = {
    deviceId: latest.deviceId,
    role: latest.role,
    lastSeen: latest.timestamp,
    distanceAlong: null,
    speedMps: null,
  };

  if (now - latest.timestamp > TRACKING_CONFIG.staleAfterMs) {
    return { ...base, verdict: 'stale' };
  }

  if (latest.accuracy > TRACKING_CONFIG.maxAccuracyM) {
    return { ...base, verdict: 'low-accuracy' };
  }

  const projection = projectOntoRoute(geometry, latest);

  if (projection.offset > TRACKING_CONFIG.maxOffRouteM) {
    return { ...base, verdict: 'off-route' };
  }

  const distanceAlong = projection.distanceAlong;

  // Walking pace held for a while, not at a stop: they got off and kept walking.
  const walkWindow = windowFrom(
    pings,
    latest.timestamp - TRACKING_CONFIG.walkingWindowMs,
  );
  const walkSpanMs = latest.timestamp - walkWindow[0].timestamp;

  if (walkSpanMs >= TRACKING_CONFIG.walkingWindowMs * 0.8) {
    const pace = distanceMeters(walkWindow[0], latest) / (walkSpanMs / 1000);
    const { min, max } = TRACKING_CONFIG.walkingSpeedMps;

    if (pace >= min && pace <= max && !isNearStop(geometry, distanceAlong)) {
      return { ...base, distanceAlong, verdict: 'walking' };
    }
  }

  // Parked at a stop for minutes: the phone stayed behind when the bus left.
  // Only applied near stops so a bus stuck in traffic still counts.
  const stillWindow = windowFrom(
    pings,
    latest.timestamp - TRACKING_CONFIG.stationaryWindowMs,
  );
  const stillSpanMs = latest.timestamp - stillWindow[0].timestamp;
  const hasNotMoved = stillWindow.every(
    (ping) => distanceMeters(ping, latest) < TRACKING_CONFIG.stationaryRadiusM,
  );

  if (
    stillSpanMs >= TRACKING_CONFIG.stationaryWindowMs * 0.9 &&
    hasNotMoved &&
    isNearStop(geometry, distanceAlong)
  ) {
    return { ...base, distanceAlong, verdict: 'stationary' };
  }

  // Progress along the route over the last few pings.
  const speedWindow = windowFrom(
    pings,
    latest.timestamp - TRACKING_CONFIG.speedWindowMs,
  );
  const speedSpanMs = latest.timestamp - speedWindow[0].timestamp;
  const speedMps =
    speedSpanMs > 0
      ? Math.max(
          0,
          (distanceAlong -
            projectOntoRoute(geometry, speedWindow[0]).distanceAlong) /
            (speedSpanMs / 1000),
        )
      : null;

  return { ...base, distanceAlong, speedMps, verdict: 'on-bus' };
};

/**
 * Groups on-bus phones that are close together along the route and keeps
 * the most convincing group. A driver counts extra; ties go to the faster
 * group, since a bus outruns someone on foot.
 */
const pickBusCluster = (candidates: Classified[]) => {
  const sorted = [...candidates].sort(
    (a, b) => (a.distanceAlong ?? 0) - (b.distanceAlong ?? 0),
  );
  const clusters: Array<Classified[]> = [];

  for (const device of sorted) {
    const current = clusters.at(-1);
    const previous = current?.at(-1);

    if (
      current &&
      previous &&
      (device.distanceAlong ?? 0) - (previous.distanceAlong ?? 0) <=
        TRACKING_CONFIG.clusterGapM
    ) {
      current.push(device);
    } else {
      clusters.push([device]);
    }
  }

  const score = (cluster: Classified[]) =>
    cluster.reduce(
      (total, device) =>
        total + (device.role === 'driver' ? TRACKING_CONFIG.driverWeight : 1),
      0,
    );
  const speedOf = (cluster: Classified[]) =>
    median(cluster.map((device) => device.speedMps ?? 0));

  return clusters.reduce<Classified[]>((best, cluster) => {
    if (best.length === 0) return cluster;

    const difference = score(cluster) - score(best);
    if (difference !== 0) return difference > 0 ? cluster : best;

    return speedOf(cluster) > speedOf(best) ? cluster : best;
  }, []);
};

interface EstimateInput {
  route: BusRoute;
  geometry: RouteGeometry;
  pingsByDevice: Map<string, LocationPing[]>;
  now: number;
  trip: TripWindow | null;
  lastLive: LiveFix | null;
}

export const estimateBus = ({
  route,
  geometry,
  pingsByDevice,
  now,
  trip,
  lastLive,
}: EstimateInput): BusEstimate => {
  const classified = [...pingsByDevice.values()]
    .filter((pings) => pings.length > 0)
    .map((pings) => classifyDevice(geometry, pings, now));

  const cluster = pickBusCluster(
    classified.filter((device) => device.verdict === 'on-bus'),
  );
  const contributorIds = new Set(cluster.map((device) => device.deviceId));

  const devices: DeviceState[] = classified.map(
    ({ speedMps: _speed, ...device }) =>
      device.verdict === 'on-bus' && !contributorIds.has(device.deviceId)
        ? { ...device, verdict: 'outlier' }
        : device,
  );

  const avgSpeedMps = kmhToMps(route.avgSpeedKmh);
  const withPosition = (distanceAlong: number) => {
    const { position, heading } = pointAtDistance(geometry, distanceAlong);
    return { distanceAlong, position, heading };
  };

  // 1. Someone on the bus is sharing right now.
  if (cluster.length > 0) {
    const driver = cluster.find((device) => device.role === 'driver');
    const source = driver ? [driver] : cluster;

    const distanceAlong = median(source.map((device) => device.distanceAlong!));
    const measuredSpeed = median(
      source.flatMap((device) =>
        device.speedMps === null ? [] : [device.speedMps],
      ),
    );

    // Smooth speed so ETAs don't jump with every ping.
    const rawSpeed = Number.isNaN(measuredSpeed) ? avgSpeedMps : measuredSpeed;
    const speedMps =
      lastLive && now - lastLive.at < TRACKING_CONFIG.staleAfterMs
        ? lastLive.speedMps * 0.7 + rawSpeed * 0.3
        : rawSpeed;

    return {
      status: 'live',
      ...withPosition(distanceAlong),
      speedMps,
      contributors: cluster.length,
      devices,
      trip,
      lastLive: { distanceAlong, speedMps, at: now },
    };
  }

  // 2. Sharing just stopped: carry on from the last fix for a short while.
  if (lastLive && now - lastLive.at < TRACKING_CONFIG.recentWindowMs) {
    const speedMps = Math.min(lastLive.speedMps, avgSpeedMps * 1.2);
    const distanceAlong = Math.min(
      geometry.length,
      lastLive.distanceAlong + (speedMps * (now - lastLive.at)) / 1000,
    );

    return {
      status: 'recent',
      ...withPosition(distanceAlong),
      speedMps,
      contributors: 0,
      devices,
      trip,
      lastLive,
    };
  }

  // 3. Nobody sharing: fall back to the timetable.
  if (trip) {
    return {
      status: 'estimated',
      ...withPosition(scheduledDistance(route, geometry, trip, now)),
      speedMps: avgSpeedMps,
      contributors: 0,
      devices,
      trip,
      lastLive,
    };
  }

  return {
    status: 'idle',
    position: null,
    heading: null,
    distanceAlong: null,
    speedMps: null,
    contributors: 0,
    devices,
    trip: null,
    lastLive,
  };
};

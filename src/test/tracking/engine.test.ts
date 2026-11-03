import { estimateBus } from '~/utils/tracking/engine';
import { computeStopEtas } from '~/utils/tracking/eta';
import {
  buildRouteGeometry,
  distanceMeters,
  offsetPoint,
  pointAtDistance,
  projectOntoRoute,
} from '~/utils/tracking/geo';
import { findActiveTrip, tripWindowFor } from '~/utils/tracking/schedule';
import { createTripSimulation } from '~/utils/tracking/simulation';
import type { LiveFix, LocationPing, SharerRole } from '~/types';
import { seedRoutes } from '~/utils/mock/seed';

const route = seedRoutes[0];
const geometry = buildRouteGeometry(route.stops);
const day = new Date(2026, 10, 3, 6, 0).getTime();
const trip = tripWindowFor(route, '07:00', day);

const ping = (
  deviceId: string,
  distance: number,
  timestamp: number,
  {
    role = 'rider',
    sideways = 0,
  }: { role?: SharerRole; sideways?: number } = {},
): LocationPing => {
  const { position, heading } = pointAtDistance(geometry, distance);
  const point = sideways
    ? offsetPoint(position, sideways, heading + 90)
    : position;

  return {
    deviceId,
    routeId: route.id,
    role,
    ...point,
    accuracy: 8,
    timestamp,
  };
};

/** Pings every 5s for a phone moving at `speed` m/s, ending at `now`. */
const track = (
  deviceId: string,
  endDistance: number,
  speed: number,
  now: number,
  options?: Parameters<typeof ping>[3],
) =>
  Array.from({ length: 24 }, (_, index) => {
    const secondsAgo = (23 - index) * 5;
    return ping(
      deviceId,
      endDistance - speed * secondsAgo,
      now - secondsAgo * 1000,
      options,
    );
  });

const estimate = (
  devices: Array<Array<LocationPing>>,
  now: number,
  lastLive: LiveFix | null = null,
) =>
  estimateBus({
    route,
    geometry,
    pingsByDevice: new Map(devices.map((pings) => [pings[0].deviceId, pings])),
    now,
    trip: findActiveTrip(route, now),
    lastLive,
  });

describe('geometry', () => {
  it('snaps a nearby point onto the route', () => {
    const halfway = geometry.length / 2;
    const { position, heading } = pointAtDistance(geometry, halfway);
    const projection = projectOntoRoute(
      geometry,
      offsetPoint(position, 30, heading + 90),
    );

    expect(projection.offset).toBeCloseTo(30, 0);
    expect(Math.abs(projection.distanceAlong - halfway)).toBeLessThan(5);
  });
});

describe('estimateBus', () => {
  const now = trip.startsAt + 6 * 60_000;

  it('reports live when a rider on the route is sharing', () => {
    const result = estimate([track('a', 2000, 9, now)], now);

    expect(result.status).toBe('live');
    expect(result.contributors).toBe(1);
    expect(result.distanceAlong).toBeCloseTo(2000, -1);
  });

  it('ignores a phone that is off the route', () => {
    const result = estimate([track('a', 2000, 9, now, { sideways: 300 })], now);

    expect(result.status).toBe('estimated');
    expect(result.devices[0].verdict).toBe('off-route');
  });

  it('ignores a phone that has gone quiet', () => {
    const result = estimate([track('a', 2000, 9, now - 60_000)], now);

    expect(result.devices[0].verdict).toBe('stale');
  });

  it('spots someone who got off and kept walking', () => {
    const rider = track('walker', 1500, 1.3, now);
    const bus = track('bus', 2600, 9, now);
    const result = estimate([rider, bus], now);

    expect(result.devices.find((d) => d.deviceId === 'walker')?.verdict).toBe(
      'walking',
    );
    expect(result.distanceAlong).toBeCloseTo(2600, -1);
  });

  it('trusts the driver over riders further back', () => {
    const result = estimate(
      [
        track('r1', 1000, 9, now),
        track('r2', 1010, 9, now),
        track('driver', 2000, 9, now, { role: 'driver' }),
      ],
      now,
    );

    expect(result.distanceAlong).toBeCloseTo(2000, -1);
  });

  it('extrapolates briefly after sharing stops, then falls back to the timetable', () => {
    const lastLive: LiveFix = { distanceAlong: 2000, speedMps: 8, at: now };

    const soon = estimate([], now + 60_000, lastLive);
    expect(soon.status).toBe('recent');
    expect(soon.distanceAlong).toBeCloseTo(2480, -1);

    const later = estimate([], now + 5 * 60_000, lastLive);
    expect(later.status).toBe('estimated');
  });

  it('is idle when no trip is running', () => {
    const result = estimate([], new Date(2026, 10, 3, 3, 0).getTime());

    expect(result.status).toBe('idle');
    expect(result.position).toBeNull();
  });
});

describe('computeStopEtas', () => {
  it('marks passed stops and orders upcoming arrivals', () => {
    const now = trip.startsAt + 6 * 60_000;
    const result = estimate(
      [track('a', geometry.stopDistances[2] + 100, 9, now)],
      now,
    );
    const etas = computeStopEtas(route, geometry, result, now);

    expect(etas.slice(0, 3).every((eta) => eta.passed)).toBe(true);

    const upcoming = etas
      .filter((eta) => !eta.passed)
      .map((eta) => eta.expectedAt!);
    expect(upcoming.length).toBe(2);
    expect(upcoming[0]).toBeGreaterThan(now);
    expect(upcoming[1]).toBeGreaterThan(upcoming[0]);
  });
});

describe('trip simulation replay', () => {
  it('keeps the tracked bus close to the real one for a whole trip', () => {
    const simulation = createTripSimulation({ route, geometry, trip });
    const history = new Map<string, Array<LocationPing>>();
    let lastLive: LiveFix | null = null;
    let liveTicks = 0;
    let worstErrorM = 0;
    let sawWalker = false;

    for (let now = trip.startsAt; now <= simulation.endsAt; now += 5_000) {
      for (const next of simulation.pingsAt(now)) {
        const pings = history.get(next.deviceId) ?? [];
        if (pings.at(-1)?.timestamp !== next.timestamp) pings.push(next);
        history.set(next.deviceId, pings.slice(-60));
      }

      const result = estimateBus({
        route,
        geometry,
        pingsByDevice: history,
        now,
        trip,
        lastLive,
      });
      lastLive = result.lastLive;

      sawWalker ||= result.devices.some(
        (device) =>
          device.deviceId === 'sim-daniel' && device.verdict !== 'on-bus',
      );

      if (result.status === 'live') {
        liveTicks++;
        const truth = pointAtDistance(
          geometry,
          simulation.busDistanceAt(now),
        ).position;
        worstErrorM = Math.max(
          worstErrorM,
          distanceMeters(truth, result.position!),
        );
      }
    }

    const totalTicks = (simulation.endsAt - trip.startsAt) / 5_000;

    expect(liveTicks / totalTicks).toBeGreaterThan(0.9);
    expect(worstErrorM).toBeLessThan(150);
    expect(sawWalker).toBe(true);
  });
});

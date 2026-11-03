import { offsetPoint, pointAtDistance } from './geo';
import { scheduledDistance, tripDurationMinutes } from './schedule';
import type { RouteGeometry } from './geo';
import type { BusRoute, LocationPing, SharerRole, TripWindow } from '~/types';

export interface SimulatedSharer {
  deviceId: string;
  label: string;
  role: SharerRole;
  boardStop: number;
  alightStop: number;
  /** Keeps sharing after getting off, to show the tracker ignoring them. */
  forgetsToStop?: boolean;
}

const PING_INTERVAL_MS = 5_000;
const WALKING_SPEED_MPS = 1.3;
const WALK_ALONG_ROAD_MS = 150_000;
const WALK_SHARING_LIMIT_MS = 10 * 60_000;

/**
 * Three riders that show off the interesting cases: a normal rider, a
 * handover between riders, and someone who forgets to stop sharing.
 */
export const defaultSharers = (route: BusRoute): SimulatedSharer[] => {
  const last = route.stops.length - 1;
  const middle = Math.min(last, Math.max(2, Math.floor(last / 2)));

  return [
    {
      deviceId: 'sim-amina',
      label: 'Amina',
      role: 'rider',
      boardStop: 0,
      alightStop: 1,
    },
    {
      deviceId: 'sim-daniel',
      label: 'Daniel',
      role: 'rider',
      boardStop: 1,
      alightStop: middle,
      forgetsToStop: true,
    },
    {
      deviceId: 'sim-farah',
      label: 'Farah',
      role: 'rider',
      boardStop: middle,
      alightStop: last,
    },
  ];
};

/** Small, repeatable GPS noise so the demo looks real but replays identically. */
const jitter = (seed: string, bucket: number) => {
  let hash = 2166136261;
  for (const char of `${seed}:${bucket}`) {
    hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  }
  const unit = (hash >>> 0) / 4294967295;

  return { meters: unit * 8, bearing: unit * 360 * 7 };
};

interface SimulationOptions {
  route: BusRoute;
  geometry: RouteGeometry;
  trip: TripWindow;
  /** Above 1 means the bus runs behind the timetable. */
  delayFactor?: number;
  sharers?: SimulatedSharer[];
}

export const createTripSimulation = ({
  route,
  geometry,
  trip,
  delayFactor = 1.15,
  sharers = defaultSharers(route),
}: SimulationOptions) => {
  const stopTime = (stopIndex: number) =>
    trip.startsAt +
    route.stops[stopIndex].minutesFromStart * 60_000 * delayFactor;

  const busDistanceAt = (time: number) =>
    scheduledDistance(
      route,
      geometry,
      trip,
      trip.startsAt + (time - trip.startsAt) / delayFactor,
    );

  const endsAt =
    trip.startsAt + tripDurationMinutes(route) * 60_000 * delayFactor;

  const positionFor = (sharer: SimulatedSharer, time: number) => {
    const boardAt = stopTime(sharer.boardStop);
    const alightAt = stopTime(sharer.alightStop);

    if (time < boardAt) return null;

    if (time <= alightAt) {
      return pointAtDistance(geometry, busDistanceAt(time)).position;
    }

    if (!sharer.forgetsToStop) return null;

    const walkedMs = time - alightAt;
    if (walkedMs > WALK_SHARING_LIMIT_MS) return null;

    // Walks on along the road for a bit, then turns off down a side street.
    const stopDistance = geometry.stopDistances[sharer.alightStop];
    const alongMs = Math.min(walkedMs, WALK_ALONG_ROAD_MS);
    const along = pointAtDistance(
      geometry,
      stopDistance + (WALKING_SPEED_MPS * alongMs) / 1000,
    );

    if (walkedMs <= WALK_ALONG_ROAD_MS) return along.position;

    const sideMeters =
      (WALKING_SPEED_MPS * (walkedMs - WALK_ALONG_ROAD_MS)) / 1000;
    return offsetPoint(along.position, sideMeters, along.heading + 90);
  };

  /** Every ping each simulated phone would have sent at or before `time`, most recent only. */
  const pingsAt = (time: number): LocationPing[] =>
    sharers.flatMap((sharer, index) => {
      // Stagger phones so they don't all report on the same tick.
      const offset = index * 1_300;
      const bucket = Math.floor((time - offset) / PING_INTERVAL_MS);
      const timestamp = bucket * PING_INTERVAL_MS + offset;
      const position = positionFor(sharer, timestamp);

      if (!position) return [];

      const noise = jitter(sharer.deviceId, bucket);
      const noisy = offsetPoint(position, noise.meters, noise.bearing);

      return [
        {
          deviceId: sharer.deviceId,
          routeId: route.id,
          role: sharer.role,
          lat: noisy.lat,
          lng: noisy.lng,
          accuracy: 6 + noise.meters,
          timestamp,
        },
      ];
    });

  return { pingsAt, busDistanceAt, endsAt, sharers };
};

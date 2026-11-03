import type { BusRoute, TripWindow } from '~/types';

import type { RouteGeometry } from './geo';

const MINUTE_MS = 60_000;

/** Converts "HH:mm" on the same calendar day as `reference` to epoch ms. */
export const timeOnDay = (hhmm: string, reference: number) => {
  const [hours, minutes] = hhmm.split(':').map(Number);
  const date = new Date(reference);
  date.setHours(hours, minutes, 0, 0);

  return date.getTime();
};

export const tripDurationMinutes = (route: BusRoute) =>
  route.stops.at(-1)?.minutesFromStart ?? 0;

export const tripWindowFor = (
  route: BusRoute,
  departure: string,
  reference: number,
): TripWindow => {
  const startsAt = timeOnDay(departure, reference);

  return {
    departure,
    startsAt,
    endsAt: startsAt + tripDurationMinutes(route) * MINUTE_MS,
  };
};

/** Today's trips, in departure order. */
export const tripsForDay = (route: BusRoute, reference: number) =>
  [...route.departures]
    .sort()
    .map((departure) => tripWindowFor(route, departure, reference));

/**
 * The trip that should be on the road at `now`. A small grace period on
 * either side covers early departures and late arrivals.
 */
export const findActiveTrip = (
  route: BusRoute,
  now: number,
  graceMinutes = 10,
): TripWindow | null => {
  const grace = graceMinutes * MINUTE_MS;

  return (
    tripsForDay(route, now).find(
      (trip) => now >= trip.startsAt - grace && now <= trip.endsAt + grace,
    ) ?? null
  );
};

export const findNextTrip = (route: BusRoute, now: number): TripWindow | null =>
  tripsForDay(route, now).find((trip) => trip.startsAt > now) ?? null;

/** Where the timetable says the bus should be, as distance along the route. */
export const scheduledDistance = (
  route: BusRoute,
  geometry: RouteGeometry,
  trip: TripWindow,
  now: number,
) => {
  const elapsedMinutes = (now - trip.startsAt) / MINUTE_MS;
  const { stops } = route;
  const { stopDistances } = geometry;

  if (elapsedMinutes <= 0) return 0;
  if (elapsedMinutes >= tripDurationMinutes(route)) return geometry.length;

  const nextIndex = stops.findIndex(
    (stop) => stop.minutesFromStart > elapsedMinutes,
  );
  const previous = stops[nextIndex - 1];
  const next = stops[nextIndex];
  const span = next.minutesFromStart - previous.minutesFromStart;
  const t =
    span === 0 ? 0 : (elapsedMinutes - previous.minutesFromStart) / span;

  return (
    stopDistances[nextIndex - 1] +
    t * (stopDistances[nextIndex] - stopDistances[nextIndex - 1])
  );
};

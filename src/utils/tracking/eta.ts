import type { BusEstimate, BusRoute, StopEta } from '~/types';

import type { RouteGeometry } from './geo';

/** Time the bus typically spends at each stop it passes through. */
const DWELL_MS = 20_000;
/** A stop counts as passed once the bus is this far beyond it. */
const PASSED_MARGIN_M = 25;

export const computeStopEtas = (
  route: BusRoute,
  geometry: RouteGeometry,
  estimate: BusEstimate,
  now: number,
): StopEta[] => {
  const { trip, distanceAlong, status } = estimate;
  const avgSpeedMps = route.avgSpeedKmh / 3.6;

  const scheduledAt = (minutesFromStart: number) =>
    trip ? trip.startsAt + minutesFromStart * 60_000 : null;

  if (distanceAlong === null) {
    return route.stops.map((stop) => ({
      stopId: stop.id,
      passed: false,
      expectedAt: scheduledAt(stop.minutesFromStart),
      scheduledAt: scheduledAt(stop.minutesFromStart),
    }));
  }

  // Keep the speed in a believable band so a red light doesn't push ETAs to infinity.
  const speedMps = Math.min(
    Math.max(estimate.speedMps ?? avgSpeedMps, avgSpeedMps * 0.5),
    avgSpeedMps * 1.3,
  );

  let stopsBefore = 0;

  return route.stops.map((stop, index) => {
    const stopDistance = geometry.stopDistances[index];
    const scheduled = scheduledAt(stop.minutesFromStart);
    const passed = distanceAlong > stopDistance + PASSED_MARGIN_M;

    if (passed) {
      return {
        stopId: stop.id,
        passed,
        expectedAt: null,
        scheduledAt: scheduled,
      };
    }

    if (status === 'estimated') {
      return {
        stopId: stop.id,
        passed,
        expectedAt: scheduled,
        scheduledAt: scheduled,
      };
    }

    const remaining = Math.max(0, stopDistance - distanceAlong);
    const expectedAt =
      now + (remaining / speedMps) * 1000 + stopsBefore * DWELL_MS;
    stopsBefore++;

    return { stopId: stop.id, passed, expectedAt, scheduledAt: scheduled };
  });
};

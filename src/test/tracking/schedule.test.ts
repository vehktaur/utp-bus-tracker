import { seedRoutes } from '~/utils/mock/seed';
import { buildRouteGeometry } from '~/utils/tracking/geo';
import {
  findActiveTrip,
  findNextTrip,
  scheduledDistance,
  timeOnDay,
  tripWindowFor,
  tripsForDay,
} from '~/utils/tracking/schedule';

const route = seedRoutes[0];
const geometry = buildRouteGeometry(route.stops);
const at = (hhmm: string) => timeOnDay(hhmm, new Date(2026, 10, 3).getTime());

describe('schedule', () => {
  it('lists the day’s trips in departure order', () => {
    const trips = tripsForDay(route, at('06:00'));

    expect(trips.map((trip) => trip.departure)).toEqual(
      [...route.departures].sort(),
    );
    expect(trips[0].endsAt - trips[0].startsAt).toBe(17 * 60_000);
  });

  it('finds the trip on the road, with a grace period', () => {
    expect(findActiveTrip(route, at('07:05'))?.departure).toBe('07:00');
    expect(findActiveTrip(route, at('06:55'))?.departure).toBe('07:00');
    expect(findActiveTrip(route, at('10:00'))).toBeNull();
  });

  it('finds the next departure', () => {
    expect(findNextTrip(route, at('09:00'))?.departure).toBe('12:30');
    expect(findNextTrip(route, at('23:00'))).toBeNull();
  });

  it('places the bus at each stop at its scheduled minute', () => {
    const trip = tripWindowFor(route, '07:00', at('06:00'));

    route.stops.forEach((stop, index) => {
      const distance = scheduledDistance(
        route,
        geometry,
        trip,
        trip.startsAt + stop.minutesFromStart * 60_000,
      );
      expect(distance).toBeCloseTo(geometry.stopDistances[index], 0);
    });
  });
});

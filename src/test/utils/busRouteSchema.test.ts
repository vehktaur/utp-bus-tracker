import { seedRoutes } from '~/utils/mock/seed';
import {
  BusRouteSchema,
  toBusRoutePayload,
  toBusRouteValues,
} from '~/utils/schemas/busRouteSchema';

const values = toBusRouteValues(seedRoutes[0]);

describe('BusRouteSchema', () => {
  it('accepts a seed route', () => {
    expect(BusRouteSchema.safeParse(values).success).toBe(true);
  });

  it('requires the first stop to be minute 0', () => {
    const stops = values.stops.map((stop, index) =>
      index === 0 ? { ...stop, minutesFromStart: 2 } : stop,
    );
    const result = BusRouteSchema.safeParse({ ...values, stops });

    expect(result.error?.issues[0]).toMatchObject({
      path: ['stops', 0, 'minutesFromStart'],
      message: 'The first stop is minute 0',
    });
  });

  it('rejects stops that go back in time', () => {
    const stops = values.stops.map((stop, index) =>
      index === 2 ? { ...stop, minutesFromStart: 1 } : stop,
    );
    const result = BusRouteSchema.safeParse({ ...values, stops });

    expect(result.error?.issues[0].path).toEqual([
      'stops',
      2,
      'minutesFromStart',
    ]);
  });

  it('rejects badly formatted departure times', () => {
    const result = BusRouteSchema.safeParse({
      ...values,
      departures: [{ time: '7am' }],
    });

    expect(result.error?.issues[0].message).toBe('Use HH:mm');
  });

  it('rejects an empty stop coordinate', () => {
    const stops = values.stops.map((stop, index) =>
      index === 1 ? { ...stop, lat: Number.NaN } : stop,
    );

    expect(BusRouteSchema.safeParse({ ...values, stops }).success).toBe(false);
  });

  it('sorts and dedupes departures in the payload', () => {
    const payload = toBusRoutePayload({
      ...values,
      departures: [{ time: '09:00' }, { time: '07:00' }, { time: '09:00' }],
    });

    expect(payload.departures).toEqual(['07:00', '09:00']);
  });
});

import { z } from 'zod';
import type { BusRoute, BusRoutePayload } from '~/types';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;
const HEX_COLOR_REGEX = /^#[0-9a-f]{6}$/i;

export const BusStopSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, 'Name the stop'),
  lat: z
    .number('Enter a latitude')
    .min(-90, 'Between -90 and 90')
    .max(90, 'Between -90 and 90'),
  lng: z
    .number('Enter a longitude')
    .min(-180, 'Between -180 and 180')
    .max(180, 'Between -180 and 180'),
  minutesFromStart: z
    .number('Enter minutes')
    .int('Whole minutes only')
    .min(0, 'Can’t be negative'),
});

export const BusRouteSchema = z
  .object({
    name: z.string().trim().min(1, 'Give the route a name'),
    description: z.string().trim().max(160, 'Keep it under 160 characters'),
    direction: z.enum(['to-campus', 'from-campus']),
    color: z.string().regex(HEX_COLOR_REGEX, 'Pick a color'),
    avgSpeedKmh: z
      .number('Enter a speed')
      .min(5, 'At least 5 km/h')
      .max(120, 'At most 120 km/h'),
    departures: z
      .array(z.object({ time: z.string().regex(TIME_REGEX, 'Use HH:mm') }))
      .min(1, 'Add at least one departure'),
    stops: z.array(BusStopSchema).min(2, 'A route needs at least two stops'),
  })
  .superRefine(({ stops }, ctx) => {
    stops.forEach((stop, index) => {
      if (index === 0 && stop.minutesFromStart !== 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['stops', 0, 'minutesFromStart'],
          message: 'The first stop is minute 0',
        });
      }

      if (
        index > 0 &&
        stop.minutesFromStart <= stops[index - 1].minutesFromStart
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['stops', index, 'minutesFromStart'],
          message: 'Must be later than the stop before',
        });
      }
    });
  });

export type BusRouteValues = z.infer<typeof BusRouteSchema>;

export const toBusRouteValues = (route: BusRoute): BusRouteValues => ({
  name: route.name,
  description: route.description,
  direction: route.direction,
  color: route.color,
  avgSpeedKmh: route.avgSpeedKmh,
  departures: route.departures.map((time) => ({ time })),
  stops: route.stops,
});

export const toBusRoutePayload = ({
  departures,
  ...values
}: BusRouteValues): BusRoutePayload => ({
  ...values,
  departures: [...new Set(departures.map(({ time }) => time))].sort(),
});

import type { BusRoute, BusStop } from '~/types';

/**
 * SAMPLE DATA. Stop names and coordinates are placeholders around UTP and
 * Seri Iskandar. Replace them with the real stops (record a trip, or edit
 * them on the admin page) before showing this to the school.
 */

const stop = (
  id: string,
  name: string,
  lat: number,
  lng: number,
  minutesFromStart: number,
): BusStop => ({ id, name, lat, lng, minutesFromStart });

const reverseStops = (stops: BusStop[], prefix: string): BusStop[] => {
  const total = stops.at(-1)?.minutesFromStart ?? 0;

  return [...stops].reverse().map((item, index) => ({
    ...item,
    id: `${prefix}-${index + 1}`,
    minutesFromStart: total - item.minutesFromStart,
  }));
};

const seriIskandarStops = [
  stop('si-1', 'Seri Iskandar Business Park', 4.3505, 100.9565, 0),
  stop('si-2', 'Seri Iskandar Town Centre', 4.358, 100.962, 4),
  stop('si-3', 'Bandar Universiti', 4.3665, 100.97, 8),
  stop('si-4', 'UTP Main Gate', 4.376, 100.9775, 12),
  stop('si-5', 'UTP Academic Complex', 4.383, 100.994, 17),
];

const ipohStops = [
  stop('ip-1', 'Ipoh Amanjaya Terminal', 4.646, 101.105, 0),
  stop('ip-2', 'Ipoh City Centre', 4.5975, 101.079, 12),
  stop('ip-3', 'Batu Gajah', 4.469, 101.041, 30),
  stop('ip-4', 'UTP Main Gate', 4.376, 100.9775, 48),
  stop('ip-5', 'UTP Academic Complex', 4.383, 100.994, 53),
];

const timestamp = new Date(2026, 10, 3).toISOString();

export const seedRoutes: BusRoute[] = [
  {
    id: 'seri-iskandar-to-utp',
    name: 'Seri Iskandar → UTP',
    description: 'Morning loop picking students up around Seri Iskandar.',
    direction: 'to-campus',
    color: '#00a19c',
    avgSpeedKmh: 32,
    stops: seriIskandarStops,
    departures: ['07:00', '07:40', '08:20', '12:30', '13:30', '17:15'],
    updatedAt: timestamp,
  },
  {
    id: 'utp-to-seri-iskandar',
    name: 'UTP → Seri Iskandar',
    description: 'Takes students from campus back into town.',
    direction: 'from-campus',
    color: '#2563eb',
    avgSpeedKmh: 32,
    stops: reverseStops(seriIskandarStops, 'su'),
    departures: ['12:00', '13:00', '17:00', '18:00', '19:30', '22:00'],
    updatedAt: timestamp,
  },
  {
    id: 'ipoh-to-utp',
    name: 'Ipoh → UTP',
    description: 'Weekday shuttle from Ipoh city to campus.',
    direction: 'to-campus',
    color: '#d97706',
    avgSpeedKmh: 55,
    stops: ipohStops,
    departures: ['06:45', '07:45', '15:00'],
    updatedAt: timestamp,
  },
  {
    id: 'utp-to-ipoh',
    name: 'UTP → Ipoh',
    description: 'Evening shuttle from campus to Ipoh city.',
    direction: 'from-campus',
    color: '#9333ea',
    avgSpeedKmh: 55,
    stops: reverseStops(ipohStops, 'ui'),
    departures: ['13:00', '17:30', '21:00'],
    updatedAt: timestamp,
  },
];

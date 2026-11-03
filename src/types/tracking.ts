import type { LatLng } from './bus';

export type SharerRole = 'driver' | 'rider';

export interface LocationPing {
  deviceId: string;
  routeId: string;
  role: SharerRole;
  lat: number;
  lng: number;
  /** GPS accuracy radius in meters */
  accuracy: number;
  timestamp: number;
}

/**
 * live: someone on the bus is sharing right now
 * recent: sharing just stopped, extrapolating from the last fix
 * estimated: nobody is sharing, following the timetable
 * idle: no trip is running
 */
export type TrackingStatus = 'live' | 'recent' | 'estimated' | 'idle';

export type DeviceVerdict =
  | 'on-bus'
  | 'stale'
  | 'low-accuracy'
  | 'off-route'
  | 'walking'
  | 'stationary'
  | 'outlier';

export interface DeviceState {
  deviceId: string;
  role: SharerRole;
  verdict: DeviceVerdict;
  distanceAlong: number | null;
  lastSeen: number;
}

export interface TripWindow {
  departure: string;
  startsAt: number;
  endsAt: number;
}

export interface LiveFix {
  distanceAlong: number;
  speedMps: number;
  at: number;
}

export interface BusEstimate {
  status: TrackingStatus;
  position: LatLng | null;
  heading: number | null;
  distanceAlong: number | null;
  speedMps: number | null;
  contributors: number;
  devices: DeviceState[];
  trip: TripWindow | null;
  lastLive: LiveFix | null;
}

export interface StopEta {
  stopId: string;
  passed: boolean;
  expectedAt: number | null;
  scheduledAt: number | null;
}

export interface TrackingSnapshot {
  now: number;
  estimate: BusEstimate;
  etas: StopEta[];
  nextTrip: TripWindow | null;
}

export interface SimulationClock {
  trip: TripWindow;
  speed: number;
  /** Real and simulated times at the last start or speed change */
  anchorReal: number;
  anchorSim: number;
}

export type TransportKind = 'local' | 'supabase';

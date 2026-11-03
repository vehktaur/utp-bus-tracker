export interface LatLng {
  lat: number;
  lng: number;
}

export type RouteDirection = 'to-campus' | 'from-campus';

export interface BusStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  /** Scheduled minutes after the trip leaves the first stop */
  minutesFromStart: number;
}

export interface BusRoute {
  id: string;
  name: string;
  description: string;
  direction: RouteDirection;
  color: string;
  /** Typical cruising speed, used when nobody is sharing */
  avgSpeedKmh: number;
  stops: BusStop[];
  /** Departure times from the first stop, as 24h "HH:mm" */
  departures: string[];
  updatedAt: string;
}

export type BusRoutePayload = Omit<BusRoute, 'id' | 'updatedAt'>;

import type { BusStop, LatLng } from '~/types';

const EARTH_RADIUS_M = 6_371_000;
const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

export const distanceMeters = (a: LatLng, b: LatLng) => {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
};

export const bearingDegrees = (a: LatLng, b: LatLng) => {
  const y = Math.sin(toRad(b.lng - a.lng)) * Math.cos(toRad(b.lat));
  const x =
    Math.cos(toRad(a.lat)) * Math.sin(toRad(b.lat)) -
    Math.sin(toRad(a.lat)) *
      Math.cos(toRad(b.lat)) *
      Math.cos(toRad(b.lng - a.lng));

  return (toDeg(Math.atan2(y, x)) + 360) % 360;
};

/** Moves a point a given number of meters along a bearing. */
export const offsetPoint = (
  origin: LatLng,
  meters: number,
  bearing: number,
): LatLng => {
  const angular = meters / EARTH_RADIUS_M;
  const theta = toRad(bearing);
  const lat1 = toRad(origin.lat);
  const lng1 = toRad(origin.lng);

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angular) +
      Math.cos(lat1) * Math.sin(angular) * Math.cos(theta),
  );
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(theta) * Math.sin(angular) * Math.cos(lat1),
      Math.cos(angular) - Math.sin(lat1) * Math.sin(lat2),
    );

  return { lat: toDeg(lat2), lng: toDeg(lng2) };
};

export interface RouteGeometry {
  points: LatLng[];
  /** Distance from the start of the route to each point, in meters. */
  cumulative: number[];
  length: number;
  /** Distance along the route of each stop, in stop order. */
  stopDistances: number[];
}

/** For now the route path runs straight through its stops, in order. */
export const buildRouteGeometry = (stops: BusStop[]): RouteGeometry => {
  const points = stops.map(({ lat, lng }) => ({ lat, lng }));
  const cumulative = points.map(() => 0);

  for (let i = 1; i < points.length; i++) {
    cumulative[i] =
      cumulative[i - 1] + distanceMeters(points[i - 1], points[i]);
  }

  return {
    points,
    cumulative,
    length: cumulative.at(-1) ?? 0,
    stopDistances: [...cumulative],
  };
};

export interface RouteProjection {
  distanceAlong: number;
  /** How far the point sits from the route line, in meters. */
  offset: number;
  snapped: LatLng;
}

/** Snaps a point to the nearest spot on the route line. */
export const projectOntoRoute = (
  geometry: RouteGeometry,
  point: LatLng,
): RouteProjection => {
  const { points, cumulative } = geometry;

  if (points.length < 2) {
    const only = points[0] ?? point;
    return {
      distanceAlong: 0,
      offset: distanceMeters(only, point),
      snapped: only,
    };
  }

  let best: RouteProjection = {
    distanceAlong: 0,
    offset: Infinity,
    snapped: points[0],
  };

  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];

    // Flat-earth approximation is accurate to centimeters at segment scale.
    const metersPerLng =
      Math.cos(toRad(a.lat)) * EARTH_RADIUS_M * (Math.PI / 180);
    const metersPerLat = EARTH_RADIUS_M * (Math.PI / 180);
    const bx = (b.lng - a.lng) * metersPerLng;
    const by = (b.lat - a.lat) * metersPerLat;
    const px = (point.lng - a.lng) * metersPerLng;
    const py = (point.lat - a.lat) * metersPerLat;

    const segmentLengthSq = bx * bx + by * by;
    const t =
      segmentLengthSq === 0
        ? 0
        : Math.min(1, Math.max(0, (px * bx + py * by) / segmentLengthSq));

    const offset = Math.hypot(px - t * bx, py - t * by);

    if (offset < best.offset) {
      best = {
        offset,
        distanceAlong: cumulative[i] + t * (cumulative[i + 1] - cumulative[i]),
        snapped: {
          lat: a.lat + t * (b.lat - a.lat),
          lng: a.lng + t * (b.lng - a.lng),
        },
      };
    }
  }

  return best;
};

/** Returns the point and travel bearing at a given distance along the route. */
export const pointAtDistance = (
  geometry: RouteGeometry,
  distance: number,
): { position: LatLng; heading: number } => {
  const { points, cumulative, length } = geometry;
  const clamped = Math.min(Math.max(distance, 0), length);

  if (points.length < 2) {
    return { position: points[0], heading: 0 };
  }

  let index = cumulative.findIndex((value) => value > clamped) - 1;
  if (index < 0) index = points.length - 2;

  const a = points[index];
  const b = points[index + 1];
  const span = cumulative[index + 1] - cumulative[index];
  const t = span === 0 ? 0 : (clamped - cumulative[index]) / span;

  return {
    position: {
      lat: a.lat + t * (b.lat - a.lat),
      lng: a.lng + t * (b.lng - a.lng),
    },
    heading: bearingDegrees(a, b),
  };
};

export const median = (values: number[]) => {
  if (values.length === 0) return NaN;

  const sorted = [...values].sort((x, y) => x - y);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
};

import type { BusEstimate, BusRoute } from '~/types';
import type { RouteGeometry } from '~/utils/tracking';

export interface BusMapProps {
  route: BusRoute;
  geometry: RouteGeometry;
  estimate: BusEstimate | null;
  myStopId?: string;
  className?: string;
}

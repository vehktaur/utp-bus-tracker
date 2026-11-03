import { GOOGLE_MAPS_API_KEY } from '~/utils';
import { GoogleBusMap } from './GoogleBusMap';
import { SchematicBusMap } from './SchematicBusMap';
import type { BusMapProps } from './types';

/** Google Maps when a key is configured, otherwise a to-scale schematic */
export const BusMap = (props: BusMapProps) =>
  GOOGLE_MAPS_API_KEY ? (
    <GoogleBusMap {...props} />
  ) : (
    <SchematicBusMap {...props} />
  );

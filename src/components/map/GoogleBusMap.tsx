import {
  AdvancedMarker,
  Map,
  Polyline,
  useMap,
} from '@vis.gl/react-google-maps';
import { LuLocateFixed } from '~/assets/icons';
import { Button } from '~/components/ui/button';
import { cn, GOOGLE_MAP_ID } from '~/utils';
import { BusMarkerIcon } from './BusMarkerIcon';
import type { BusMapProps } from './types';

const boundsFor = (points: google.maps.LatLngLiteral[]) => ({
  north: Math.max(...points.map((point) => point.lat)),
  south: Math.min(...points.map((point) => point.lat)),
  east: Math.max(...points.map((point) => point.lng)),
  west: Math.min(...points.map((point) => point.lng)),
});

function FollowBusButton({
  position,
}: {
  position: google.maps.LatLngLiteral | null;
}) {
  const map = useMap();

  if (!position) return null;

  return (
    <Button
      variant="outline"
      size="icon"
      className="absolute right-3 bottom-10 z-10 rounded-full bg-white shadow-md"
      onClick={() => {
        map?.panTo(position);
        map?.setZoom(16);
      }}
      aria-label="Center on bus"
    >
      <LuLocateFixed />
    </Button>
  );
}

export function GoogleBusMap({
  route,
  geometry,
  estimate,
  myStopId,
  className,
}: BusMapProps) {
  const position = estimate?.position ?? null;

  return (
    <div className={cn('relative size-full', className)}>
      <Map
        mapId={GOOGLE_MAP_ID}
        defaultBounds={{ ...boundsFor(geometry.points), padding: 48 }}
        gestureHandling="greedy"
        disableDefaultUI
        clickableIcons={false}
        className="size-full"
      >
        <Polyline
          path={geometry.points}
          strokeColor="#ffffff"
          strokeWeight={10}
        />
        <Polyline
          path={geometry.points}
          strokeColor={route.color}
          strokeWeight={6}
        />

        {route.stops.map((stop, index) => {
          const isMine = stop.id === myStopId;
          const isEnd = index === 0 || index === route.stops.length - 1;

          return (
            <AdvancedMarker
              key={stop.id}
              position={stop}
              title={stop.name}
              anchorPoint={['50%', '50%']}
            >
              <span
                className={cn(
                  'block rounded-full border-[3px] bg-white shadow',
                  isEnd || isMine ? 'size-5' : 'size-3.5',
                  isMine && 'ring-4 ring-amber-300',
                )}
                style={{ borderColor: route.color }}
              />
            </AdvancedMarker>
          );
        })}

        {position && estimate && (
          <AdvancedMarker
            position={position}
            zIndex={1000}
            anchorPoint={['50%', '50%']}
          >
            <BusMarkerIcon status={estimate.status} />
          </AdvancedMarker>
        )}
      </Map>

      <FollowBusButton position={position} />
    </div>
  );
}

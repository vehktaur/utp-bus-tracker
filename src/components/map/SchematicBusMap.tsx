import { motion } from 'motion/react';
import type { LatLng } from '~/types';
import { cn, TRACKING_STATUS } from '~/utils';
import type { BusMapProps } from './types';

const WIDTH = 1000;
const PADDING = 90;
/** Room at the top for the back button and status pill */
const TOP_INSET = 110;
/** Stops closer than this on screen get labels on opposite sides */
const LABEL_CLASH_DISTANCE = 120;

/** Fits lat/lng points into an SVG box, keeping real-world proportions. */
const createProjector = (points: LatLng[]) => {
  const lats = points.map((point) => point.lat);
  const lngs = points.map((point) => point.lng);
  const [south, north] = [Math.min(...lats), Math.max(...lats)];
  const [west, east] = [Math.min(...lngs), Math.max(...lngs)];

  const lngScale = Math.cos((((north + south) / 2) * Math.PI) / 180);
  const spanX = Math.max((east - west) * lngScale, 1e-6);
  const spanY = Math.max(north - south, 1e-6);
  const scale = (WIDTH - PADDING * 2) / Math.max(spanX, spanY);
  const height = Math.max(spanY * scale + PADDING * 2 + TOP_INSET, 600);
  const offsetX = (WIDTH - spanX * scale) / 2;
  const offsetY = TOP_INSET + (height - TOP_INSET - spanY * scale) / 2;

  return {
    height,
    project: ({ lat, lng }: LatLng) => ({
      x: offsetX + (lng - west) * lngScale * scale,
      y: offsetY + (north - lat) * scale,
    }),
  };
};

/**
 * Stand-in map for when no Google Maps key is configured. Draws the route,
 * stops and bus to scale so the demo still works anywhere.
 */
export function SchematicBusMap({
  route,
  geometry,
  estimate,
  myStopId,
  className,
}: BusMapProps) {
  const { height, project } = createProjector(geometry.points);
  const path = geometry.points
    .map((point, index) => {
      const { x, y } = project(point);
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const bus = estimate?.position ? project(estimate.position) : null;
  const busColor = estimate
    ? TRACKING_STATUS[estimate.status].color
    : undefined;

  return (
    <div
      className={cn(
        'relative size-full overflow-hidden bg-[radial-gradient(circle_at_1px_1px,oklch(0.85_0.01_190)_1px,transparent_0)] [background-size:22px_22px]',
        className,
      )}
    >
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        className="size-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Map of ${route.name}`}
      >
        <path
          d={path}
          fill="none"
          stroke="white"
          strokeWidth={22}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={path}
          fill="none"
          stroke={route.color}
          strokeWidth={12}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {route.stops.map((stop, index) => {
          const { x, y } = project(stop);
          const isMine = stop.id === myStopId;
          const isEnd = index === 0 || index === route.stops.length - 1;
          const previous = index > 0 ? project(route.stops[index - 1]) : null;
          const clashesWithPrevious =
            previous !== null &&
            Math.hypot(previous.x - x, previous.y - y) < LABEL_CLASH_DISTANCE;
          const defaultLeft = x > WIDTH * 0.6;
          const labelOnLeft = clashesWithPrevious ? !defaultLeft : defaultLeft;

          return (
            <g key={stop.id}>
              {isMine && (
                <circle cx={x} cy={y} r={30} fill="#fcd34d" opacity={0.6} />
              )}
              <circle
                cx={x}
                cy={y}
                r={isEnd || isMine ? 17 : 12}
                fill="white"
                stroke={route.color}
                strokeWidth={7}
              />
              <text
                x={labelOnLeft ? x - 30 : x + 30}
                y={y + 9}
                textAnchor={labelOnLeft ? 'end' : 'start'}
                className="fill-foreground font-outfit text-[26px] font-medium"
                paintOrder="stroke"
                stroke="white"
                strokeWidth={8}
              >
                {stop.name}
              </text>
            </g>
          );
        })}

        {bus && (
          <motion.g
            initial={false}
            animate={{ x: bus.x, y: bus.y }}
            transition={{ type: 'tween', ease: 'linear', duration: 0.25 }}
          >
            {estimate?.status === 'live' && (
              <motion.circle
                r={34}
                fill={busColor}
                initial={{ scale: 0.6, opacity: 0.5 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            )}
            <circle
              r={30}
              fill={busColor}
              stroke="white"
              strokeWidth={7}
              strokeDasharray={
                estimate?.status === 'estimated' ? '10 7' : undefined
              }
            />
            <path
              d="M-11 -12h22a4 4 0 0 1 4 4v15a3 3 0 0 1-3 3h-24a3 3 0 0 1-3-3v-15a4 4 0 0 1 4-4zM-11 -4h22M-8 14v3M8 14v3"
              fill="none"
              stroke="white"
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.g>
        )}
      </svg>
    </div>
  );
}

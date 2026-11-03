import { Link } from '@tanstack/react-router';
import { LuChevronRight, LuClock, LuMapPin } from '~/assets/icons';
import type { BusRoute } from '~/types';
import { formatClock, formatMinutesUntil } from '~/utils';
import {
  findActiveTrip,
  findNextTrip,
  tripDurationMinutes,
} from '~/utils/tracking';

const TripStatus = ({ route, now }: { route: BusRoute; now: number }) => {
  const activeTrip = findActiveTrip(route, now, 0);
  const nextTrip = findNextTrip(route, now);

  if (activeTrip) {
    return (
      <span className="text-live inline-flex items-center gap-1.5 font-medium">
        <span className="relative flex size-2">
          <span className="bg-live animate-live-pulse absolute inset-0 rounded-full" />
          <span className="bg-live relative size-2 rounded-full" />
        </span>
        On the road · {activeTrip.departure} trip
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <LuClock className="text-muted-foreground size-4" />
      {nextTrip ? (
        <>
          Next {formatClock(nextTrip.startsAt)}
          <span className="text-muted-foreground">
            · in {formatMinutesUntil(nextTrip.startsAt, now)}
          </span>
        </>
      ) : (
        <span className="text-muted-foreground">No more trips today</span>
      )}
    </span>
  );
};

export default function RouteCard({
  route,
  now,
}: {
  route: BusRoute;
  now: number;
}) {
  const first = route.stops[0];
  const last = route.stops.at(-1);

  return (
    <Link
      to="/track/$routeId"
      params={{ routeId: route.id }}
      className="group bg-card hover:border-primary/40 relative flex h-full flex-col overflow-hidden rounded-2xl border p-4 pl-5 shadow-xs transition hover:shadow-md"
    >
      <span
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ backgroundColor: route.color }}
      />

      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{route.name}</h3>
          <p className="text-muted-foreground mt-0.5 line-clamp-1 text-sm">
            {first.name} to {last?.name}
          </p>
        </div>
        <LuChevronRight className="text-muted-foreground mt-0.5 size-5 shrink-0 transition group-hover:translate-x-0.5" />
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-4 text-sm">
        <TripStatus route={route} now={now} />
        <span className="text-muted-foreground inline-flex items-center gap-1.5">
          <LuMapPin className="size-4" />
          {route.stops.length} stops · {tripDurationMinutes(route)} min
        </span>
      </div>
    </Link>
  );
}

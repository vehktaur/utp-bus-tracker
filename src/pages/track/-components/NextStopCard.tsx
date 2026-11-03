import { AnimatePresence, motion } from 'motion/react';
import { LuCalendarClock, LuInfo, LuStar } from '~/assets/icons';
import type { BusRoute, StopEta, TrackingSnapshot } from '~/types';
import { cn, formatClock, formatMinutesUntil, TRACKING_STATUS } from '~/utils';

const punctuality = ({ expectedAt, scheduledAt }: StopEta) => {
  if (expectedAt === null || scheduledAt === null) return null;

  const minutes = Math.round((expectedAt - scheduledAt) / 60_000);

  if (Math.abs(minutes) <= 1)
    return { text: 'On time', className: 'text-live' };
  return minutes > 0
    ? { text: `${minutes} min late`, className: 'text-recent' }
    : { text: `${-minutes} min early`, className: 'text-primary' };
};

export default function NextStopCard({
  route,
  snapshot: { estimate, etas, now, nextTrip },
  myStopId,
  isSimulating,
}: {
  route: BusRoute;
  snapshot: TrackingSnapshot;
  myStopId?: string;
  isSimulating: boolean;
}) {
  if (estimate.status === 'idle') {
    return (
      <section className="card flex items-center gap-3">
        <span className="bg-muted text-muted-foreground grid size-11 shrink-0 place-items-center rounded-2xl">
          <LuCalendarClock className="size-5" />
        </span>
        <div>
          <h2 className="font-semibold">No bus on this route right now</h2>
          <p className="text-muted-foreground text-sm">
            {nextTrip
              ? `Next departure ${formatClock(nextTrip.startsAt)}, in ${formatMinutesUntil(nextTrip.startsAt, now)}.`
              : 'No more trips today.'}
            {!isSimulating && ' Try demo mode below to see a trip.'}
          </p>
        </div>
      </section>
    );
  }

  const upcoming = etas.filter((eta) => !eta.passed);
  const mine = upcoming.find((eta) => eta.stopId === myStopId);
  const target = mine ?? upcoming.at(0);

  if (!target) {
    return (
      <section className="card">
        <h2 className="font-semibold">
          This trip has reached {route.stops.at(-1)?.name}
        </h2>
      </section>
    );
  }

  const stop = route.stops.find(({ id }) => id === target.stopId);
  const timing = punctuality(target);
  const { text, note } = TRACKING_STATUS[estimate.status];
  const countdown = target.expectedAt
    ? `in ${formatMinutesUntil(target.expectedAt, now)}`
    : '—';

  return (
    <section
      className="bg-card overflow-hidden rounded-3xl border"
      aria-live="polite"
    >
      <div className="clamp-[p,4,5]">
        <p className="text-muted-foreground flex items-center gap-1.5 text-sm">
          {mine && (
            <LuStar className="size-3.5 fill-amber-400 text-amber-400" />
          )}
          Bus reaches{' '}
          <span className="text-foreground font-medium">{stop?.name}</span>
        </p>

        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={countdown}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={cn(
              'clamp-[text,4xl,5xl] mt-1 font-semibold tracking-tight',
              text,
            )}
          >
            {countdown}
          </motion.p>
        </AnimatePresence>

        <p className="mt-1 flex flex-wrap gap-x-2 text-sm">
          {target.expectedAt && (
            <span>Around {formatClock(target.expectedAt)}</span>
          )}
          {timing && (
            <span className={cn('font-medium', timing.className)}>
              · {timing.text}
            </span>
          )}
        </p>
      </div>

      <p className="bg-muted/60 text-muted-foreground flex items-center gap-2 px-5 py-2.5 text-xs">
        <LuInfo className="size-3.5 shrink-0" />
        {note}
        {!mine && ' Tap ☆ on a stop below to follow your own stop.'}
      </p>
    </section>
  );
}

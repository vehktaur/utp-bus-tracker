import { motion } from 'motion/react';
import { Fragment } from 'react';
import { LuBusFront, LuStar } from '~/assets/icons';
import { useSharingStore } from '~/store';
import type { BusRoute, TrackingSnapshot } from '~/types';
import { cn, formatClock, formatMinutesUntil, TRACKING_STATUS } from '~/utils';

export default function StopTimeline({
  route,
  snapshot: { estimate, etas, now },
  myStopId,
}: {
  route: BusRoute;
  snapshot: TrackingSnapshot;
  myStopId?: string;
}) {
  const toggleMyStop = useSharingStore((s) => s.toggleMyStop);
  const isRunning = estimate.status !== 'idle';
  const { bg, text, label } = TRACKING_STATUS[estimate.status];

  // The bus sits between the last stop it passed and the next one
  const busAfterIndex = isRunning
    ? etas.findLastIndex((eta) => eta.passed)
    : -2;

  return (
    <section className="card" aria-labelledby="stops-heading">
      <h2 id="stops-heading" className="mb-4 font-semibold">
        Stops
      </h2>

      <ol>
        {route.stops.map((stop, index) => {
          const eta = etas.at(index);
          const isMine = stop.id === myStopId;
          const isLast = index === route.stops.length - 1;
          const passed = !!eta?.passed;

          return (
            <Fragment key={stop.id}>
              {busAfterIndex === index - 1 && (
                <motion.li
                  layout
                  className="relative flex items-center gap-3 pb-4"
                  aria-label="Current bus position"
                >
                  <span
                    className="absolute inset-y-0 left-[0.6875rem] w-0.5 opacity-30"
                    style={{ backgroundColor: route.color }}
                  />
                  <span
                    className={cn(
                      'relative z-10 grid size-6 place-items-center rounded-full text-white shadow',
                      bg,
                    )}
                  >
                    <LuBusFront className="size-3.5" />
                  </span>
                  <span className={cn('text-sm font-medium', text)}>
                    {estimate.status === 'live'
                      ? 'Bus is here'
                      : `${label} position`}
                  </span>
                </motion.li>
              )}

              <li className="relative flex gap-3 pb-5 last:pb-0">
                {!isLast && (
                  <span
                    className={cn(
                      'absolute top-6 bottom-0 left-[0.6875rem] w-0.5',
                      !passed && 'opacity-30',
                    )}
                    style={{ backgroundColor: route.color }}
                  />
                )}

                <span
                  className="relative z-10 mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-[3px] bg-white"
                  style={{
                    borderColor: route.color,
                    backgroundColor: passed ? route.color : undefined,
                  }}
                />

                <div className="flex min-w-0 grow items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p
                      className={cn(
                        'truncate font-medium',
                        passed && 'text-muted-foreground',
                      )}
                    >
                      {stop.name}
                    </p>
                    {eta?.scheduledAt && (
                      <p className="text-muted-foreground text-xs">
                        Scheduled {formatClock(eta.scheduledAt)}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-start gap-1">
                    <span className="text-right text-sm">
                      {passed ? (
                        <span className="text-muted-foreground">Passed</span>
                      ) : isRunning && eta?.expectedAt ? (
                        <>
                          <span className="block font-semibold">
                            {formatMinutesUntil(eta.expectedAt, now)}
                          </span>
                          <span className="text-muted-foreground block text-xs">
                            {formatClock(eta.expectedAt)}
                          </span>
                        </>
                      ) : null}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleMyStop(route.id, stop.id)}
                      aria-pressed={isMine}
                      aria-label={
                        isMine
                          ? `Stop following ${stop.name}`
                          : `Follow ${stop.name}`
                      }
                      className="hover:bg-muted -mt-1 grid size-8 place-items-center rounded-full transition"
                    >
                      <LuStar
                        className={cn(
                          'size-4',
                          isMine
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground',
                        )}
                      />
                    </button>
                  </div>
                </div>
              </li>
            </Fragment>
          );
        })}
      </ol>
    </section>
  );
}

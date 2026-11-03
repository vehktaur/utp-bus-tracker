import { AnimatePresence, motion } from 'motion/react';
import type { BusEstimate } from '~/types';
import { cn, formatTimeAgo, TRACKING_STATUS } from '~/utils';

const detailFor = (
  { status, contributors, lastLive }: BusEstimate,
  now: number,
) => {
  if (status === 'live') return `${contributors} sharing`;
  if (status === 'recent' && lastLive) return formatTimeAgo(lastLive.at, now);
  if (status === 'estimated') return 'from timetable';
  return null;
};

export default function StatusPill({
  estimate,
  now,
  className,
}: {
  estimate: BusEstimate;
  now: number;
  className?: string;
}) {
  const { label, bg } = TRACKING_STATUS[estimate.status];
  const detail = detailFor(estimate, now);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-center gap-2 rounded-full border bg-white/95 py-2 pr-4 pl-3 text-sm shadow-md backdrop-blur',
        className,
      )}
    >
      <span className="relative flex size-2.5">
        {estimate.status === 'live' && (
          <span
            className={cn(
              'animate-live-pulse absolute inset-0 rounded-full',
              bg,
            )}
          />
        )}
        <span className={cn('relative size-2.5 rounded-full', bg)} />
      </span>

      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={estimate.status}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          className="font-semibold"
        >
          {label}
        </motion.span>
      </AnimatePresence>

      {detail && <span className="text-muted-foreground">· {detail}</span>}
    </div>
  );
}

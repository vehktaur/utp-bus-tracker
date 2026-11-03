import { LuBusFront } from '~/assets/icons';
import type { TrackingStatus } from '~/types';
import { cn, TRACKING_STATUS } from '~/utils';

export const BusMarkerIcon = ({ status }: { status: TrackingStatus }) => {
  const { bg } = TRACKING_STATUS[status];

  return (
    <div className="relative grid size-11 place-items-center" aria-label="Bus">
      {status === 'live' && (
        <span
          className={cn('animate-live-pulse absolute inset-0 rounded-full', bg)}
        />
      )}
      <span
        className={cn(
          'relative grid size-11 place-items-center rounded-full border-[3px] border-white text-white shadow-lg',
          bg,
          status === 'estimated' && 'border-dashed opacity-90',
        )}
      >
        <LuBusFront className="size-5" strokeWidth={2.4} />
      </span>
    </div>
  );
};

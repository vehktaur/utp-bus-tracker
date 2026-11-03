import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { BusEstimate, DeviceVerdict } from '~/types';

/** How long a phone can look off the bus before its sharing stops */
const AUTO_STOP_AFTER_MS = 3 * 60_000;
const OFF_BUS_VERDICTS: DeviceVerdict[] = [
  'walking',
  'off-route',
  'stationary',
];

/** Stops sharing for someone who got off but forgot to turn it off */
export const useAutoStopSharing = ({
  estimate,
  deviceId,
  isSharing,
  stop,
}: {
  estimate?: BusEstimate;
  deviceId: string;
  isSharing: boolean;
  stop: () => void;
}) => {
  const offBusSinceRef = useRef<number | null>(null);
  const verdict = estimate?.devices.find(
    (device) => device.deviceId === deviceId,
  )?.verdict;

  useEffect(() => {
    if (!isSharing || !verdict || !OFF_BUS_VERDICTS.includes(verdict)) {
      offBusSinceRef.current = null;
      return;
    }

    offBusSinceRef.current ??= Date.now();

    if (Date.now() - offBusSinceRef.current > AUTO_STOP_AFTER_MS) {
      offBusSinceRef.current = null;
      stop();
      toast('Sharing stopped', {
        description:
          'Looks like you got off the bus, so we stopped sharing your location.',
      });
    }
  }, [verdict, isSharing, stop]);
};

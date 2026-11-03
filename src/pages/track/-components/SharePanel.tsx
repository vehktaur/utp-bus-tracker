import { AnimatePresence, motion } from 'motion/react';
import {
  LuMonitorSmartphone,
  LuRadio,
  LuShieldCheck,
  LuTriangleAlert,
} from '~/assets/icons';
import { Button } from '~/components/ui/button';
import { Switch } from '~/components/ui/switch';
import type { useShareLocation } from '~/hooks';
import { useSharingStore } from '~/store';

type Share = ReturnType<typeof useShareLocation>;

const fade = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
};

export default function SharePanel({
  share,
  isSimulating,
}: {
  share: Share;
  isSimulating: boolean;
}) {
  const role = useSharingStore((s) => s.role);
  const setRole = useSharingStore((s) => s.setRole);

  return (
    <div>
      <AnimatePresence mode="wait" initial={false}>
        {share.isSharing ? (
          <motion.section
            key="sharing"
            {...fade}
            className="border-live/30 bg-live-muted/60 clamp-[p,4,5] rounded-3xl border"
          >
            <div className="flex items-center gap-3">
              <span className="bg-live relative grid size-11 shrink-0 place-items-center rounded-2xl text-white">
                <span className="animate-live-pulse bg-live absolute inset-0 rounded-2xl" />
                <LuRadio className="relative size-5" />
              </span>
              <div>
                <h2 className="font-semibold">
                  You’re sharing the bus location
                </h2>
                <p className="text-muted-foreground text-sm">
                  {share.lastFixAt ? 'GPS is connected.' : 'Waiting for GPS…'}{' '}
                  Thanks for helping everyone waiting.
                </p>
              </div>
            </div>

            <p className="text-muted-foreground mt-4 flex items-start gap-2 text-sm">
              <LuMonitorSmartphone className="mt-0.5 size-4 shrink-0" />
              {share.wakeLock.isLocked
                ? 'Your screen will stay on while you share. Browsers pause GPS when the screen locks.'
                : 'Keep this screen open while you ride. Browsers pause GPS when the screen locks.'}
            </p>

            <Button
              variant="outline"
              size="lg"
              className="mt-4 w-full"
              onClick={share.stop}
            >
              I got off, stop sharing
            </Button>
          </motion.section>
        ) : (
          <motion.section key="idle" {...fade} className="card">
            <h2 className="font-semibold">On this bus right now?</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Share your location while you ride so everyone waiting can see
              where the bus is. It stops by itself when you get off.
            </p>

            <Button
              size="lg"
              className="mt-4 w-full"
              onClick={share.start}
              disabled={isSimulating || !share.isSupported}
            >
              <LuRadio />
              I’m on this bus
            </Button>

            <div className="mt-4 flex items-center justify-between gap-3">
              <label htmlFor="driver-switch" className="text-sm">
                I’m the driver
              </label>
              <Switch
                id="driver-switch"
                checked={role === 'driver'}
                onCheckedChange={(checked) =>
                  setRole(checked ? 'driver' : 'rider')
                }
              />
            </div>

            <p className="text-muted-foreground mt-4 flex items-start gap-2 text-xs">
              <LuShieldCheck className="mt-0.5 size-4 shrink-0" />
              Anonymous. No name or account, and your location is only used
              while you’re on the route.
            </p>

            {isSimulating && (
              <p className="text-muted-foreground mt-3 text-xs">
                Turn off demo mode to share for real.
              </p>
            )}
            {share.isSharingElsewhere && (
              <p className="text-recent mt-3 text-xs">
                You’re sharing on another route. Starting here switches to this
                one.
              </p>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {share.error && (
        <p
          className="text-destructive mt-2 flex items-start gap-2 text-sm"
          role="alert"
        >
          <LuTriangleAlert className="mt-0.5 size-4 shrink-0" />
          {share.error}
        </p>
      )}
    </div>
  );
}

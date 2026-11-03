import { LuFlaskConical, LuWifi } from '~/assets/icons';
import { Switch } from '~/components/ui/switch';
import { SIMULATION_SPEEDS } from '~/hooks';
import type { useSimulation } from '~/hooks';
import type { TransportKind } from '~/types';
import { cn, formatClock } from '~/utils';

type Simulation = ReturnType<typeof useSimulation>;

export default function DemoPanel({
  simulation: { clock, start, stop, setSpeed },
  now,
  transportKind,
}: {
  simulation: Simulation;
  now: number | null;
  transportKind: TransportKind;
}) {
  return (
    <section
      className="clamp-[p,4,5] rounded-3xl border border-dashed"
      aria-labelledby="demo-heading"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="bg-accent text-accent-foreground grid size-10 shrink-0 place-items-center rounded-2xl">
            <LuFlaskConical className="size-5" />
          </span>
          <div>
            <label
              id="demo-heading"
              htmlFor="demo-switch"
              className="font-semibold"
            >
              Demo mode
            </label>
            <p className="text-muted-foreground text-sm">
              Replays a trip with three riders sharing.
            </p>
          </div>
        </div>
        <Switch
          id="demo-switch"
          checked={!!clock}
          onCheckedChange={(checked) => (checked ? start() : stop())}
        />
      </div>

      {clock && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div
            className="bg-muted inline-flex rounded-xl p-1"
            role="group"
            aria-label="Playback speed"
          >
            {SIMULATION_SPEEDS.map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => setSpeed(speed)}
                aria-pressed={clock.speed === speed}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition',
                  clock.speed === speed
                    ? 'bg-card shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {speed}×
              </button>
            ))}
          </div>
          {now && (
            <span className="text-muted-foreground text-sm tabular-nums">
              Demo clock {formatClock(now)}
            </span>
          )}
        </div>
      )}

      <p className="text-muted-foreground mt-4 flex items-start gap-2 text-xs">
        <LuWifi className="mt-0.5 size-3.5 shrink-0" />
        {transportKind === 'supabase'
          ? 'Live sharing is connected across phones.'
          : 'Live sharing currently reaches other tabs on this device. Add Supabase keys to share across phones.'}
      </p>
    </section>
  );
}

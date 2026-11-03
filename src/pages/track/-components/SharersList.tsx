import { LuCar, LuSmartphone } from '~/assets/icons';
import { Badge } from '~/components/ui/badge';
import type { DeviceState } from '~/types';
import { DEVICE_VERDICTS, formatTimeAgo } from '~/utils';
import type { SimulatedSharer } from '~/utils/tracking';

/** Every phone the tracker heard from, and whether it trusted it */
export default function SharersList({
  devices,
  sharers,
  myDeviceId,
  now,
}: {
  devices: DeviceState[];
  sharers: SimulatedSharer[];
  myDeviceId: string;
  now: number;
}) {
  const nameFor = (deviceId: string) =>
    deviceId === myDeviceId
      ? 'You'
      : (sharers.find((sharer) => sharer.deviceId === deviceId)?.label ??
        `Phone ${deviceId.slice(0, 4)}`);

  return (
    <section className="card" aria-labelledby="sharers-heading">
      <h2 id="sharers-heading" className="font-semibold">
        Who’s sharing
      </h2>
      <p className="text-muted-foreground mt-1 text-sm">
        Only phones that look like they’re on the bus move the bus marker.
      </p>

      <ul className="mt-4 grid gap-3">
        {devices.map(({ deviceId, role, verdict, lastSeen }) => {
          const { label, variant } = DEVICE_VERDICTS[verdict];
          const Icon = role === 'driver' ? LuCar : LuSmartphone;

          return (
            <li key={deviceId} className="flex items-center gap-3">
              <span className="bg-muted grid size-9 shrink-0 place-items-center rounded-xl">
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 grow">
                <span className="block truncate text-sm font-medium">
                  {nameFor(deviceId)}
                  {role === 'driver' && (
                    <span className="text-muted-foreground font-normal">
                      {' '}
                      · driver
                    </span>
                  )}
                </span>
                <span className="text-muted-foreground block text-xs">
                  Updated {formatTimeAgo(lastSeen, now)}
                </span>
              </span>
              <Badge variant={variant}>{label}</Badge>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

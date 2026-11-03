import { createFileRoute, Link } from '@tanstack/react-router';
import { LuArrowLeft } from '~/assets/icons';
import { BusMap } from '~/components';
import { Button } from '~/components/ui/button';
import {
  busRouteQueryOptions,
  useAutoStopSharing,
  useBusRoute,
  useBusTracking,
  useShareLocation,
  useSimulation,
} from '~/hooks';
import { useSharingStore } from '~/store';
import DemoPanel from './-components/DemoPanel';
import NextStopCard from './-components/NextStopCard';
import SharePanel from './-components/SharePanel';
import SharersList from './-components/SharersList';
import StatusPill from './-components/StatusPill';
import StopTimeline from './-components/StopTimeline';

export const Route = createFileRoute('/track/$routeId')({
  loader: ({ context: { queryClient }, params: { routeId } }) =>
    queryClient.ensureQueryData(busRouteQueryOptions(routeId)),
  component: TrackPage,
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.name ?? 'Track'} | UTP Bus Tracker` }],
  }),
});

function TrackPage() {
  const { routeId } = Route.useParams();
  const { data: route } = useBusRoute(routeId);

  const simulation = useSimulation(route);
  const { geometry, snapshot, sharers, transportKind } = useBusTracking(
    route,
    simulation.clock,
  );
  const share = useShareLocation(route.id);
  const myStopId = useSharingStore((s) => s.myStops[route.id]);

  useAutoStopSharing({
    estimate: snapshot?.estimate,
    deviceId: share.deviceId,
    isSharing: share.isSharing,
    stop: share.stop,
  });

  const isSimulating = !!simulation.clock;

  return (
    <div className="flex h-dvh flex-col lg:flex-row">
      <section
        className="relative h-[44dvh] shrink-0 lg:h-full lg:flex-1"
        aria-label="Map"
      >
        <BusMap
          route={route}
          geometry={geometry}
          estimate={snapshot?.estimate ?? null}
          myStopId={myStopId}
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 lg:p-4">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="pointer-events-auto shadow-md"
          >
            <Link to="/" aria-label="All routes">
              <LuArrowLeft className="size-5" />
            </Link>
          </Button>

          {snapshot && (
            <StatusPill
              className="pointer-events-auto"
              estimate={snapshot.estimate}
              now={snapshot.now}
            />
          )}
        </div>
      </section>

      <aside className="bg-background relative z-10 -mt-5 min-h-0 flex-1 overflow-y-auto rounded-t-3xl shadow-[0_-8px_24px_-12px_rgb(0_0_0/0.15)] lg:mt-0 lg:w-[27rem] lg:flex-none lg:rounded-none lg:border-l lg:shadow-none">
        <div className="mx-auto flex max-w-xl flex-col gap-4 px-4 pt-3 pb-10 lg:pt-6">
          <span className="bg-border mx-auto h-1.5 w-10 rounded-full lg:hidden" />

          <header className="flex items-center gap-3">
            <span
              className="h-10 w-1.5 rounded-full"
              style={{ backgroundColor: route.color }}
            />
            <div>
              <h1 className="clamp-[text,xl,2xl] font-semibold">
                {route.name}
              </h1>
              <p className="text-muted-foreground text-sm">
                {route.description}
              </p>
            </div>
          </header>

          {snapshot && (
            <NextStopCard
              route={route}
              snapshot={snapshot}
              myStopId={myStopId}
              isSimulating={isSimulating}
            />
          )}

          <SharePanel share={share} isSimulating={isSimulating} />

          {snapshot && (
            <StopTimeline
              route={route}
              snapshot={snapshot}
              myStopId={myStopId}
            />
          )}

          {!!snapshot?.estimate.devices.length && (
            <SharersList
              devices={snapshot.estimate.devices}
              sharers={sharers}
              myDeviceId={share.deviceId}
              now={snapshot.now}
            />
          )}

          <DemoPanel
            simulation={simulation}
            now={snapshot?.now ?? null}
            transportKind={transportKind}
          />
        </div>
      </aside>
    </div>
  );
}

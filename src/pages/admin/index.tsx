import { createFileRoute } from '@tanstack/react-router';
import { LuRotateCcw } from '~/assets/icons';
import { Button } from '~/components/ui/button';
import { Heading } from '~/components/ui/heading';
import { busRoutesQueryOptions, useResetBusRoutes } from '~/hooks';
import { isMockApi } from '~/utils';
import RoutesTable from './-components/RoutesTable';

export const Route = createFileRoute('/admin/')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(busRoutesQueryOptions),
  component: AdminRoutesPage,
});

function AdminRoutesPage() {
  const { mutate: resetRoutes, isPending: isResettingRoutes } =
    useResetBusRoutes();

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Heading as="h1" size="page">
            Routes and timetables
          </Heading>
          <p className="text-muted-foreground mt-1 max-w-xl">
            Stops and departure times drive the ETAs, and the timetable fallback
            when nobody on the bus is sharing.
          </p>
        </div>

        {isMockApi && (
          <Button
            variant="outline"
            onClick={() => resetRoutes()}
            isLoading={isResettingRoutes}
          >
            {!isResettingRoutes && <LuRotateCcw />}
            Restore sample data
          </Button>
        )}
      </div>

      <RoutesTable />
    </>
  );
}

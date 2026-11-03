import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { LuArrowLeft } from '~/assets/icons';
import { Heading } from '~/components/ui/heading';
import { busRouteQueryOptions, useBusRoute, useUpdateBusRoute } from '~/hooks';
import { toBusRoutePayload } from '~/utils/schemas/busRouteSchema';
import type { BusRouteValues } from '~/utils/schemas/busRouteSchema';
import RouteForm from './-components/RouteForm';

export const Route = createFileRoute('/admin/$routeId')({
  loader: ({ context: { queryClient }, params: { routeId } }) =>
    queryClient.ensureQueryData(busRouteQueryOptions(routeId)),
  component: EditRoutePage,
  head: ({ loaderData }) => ({
    meta: [{ title: `Edit ${loaderData?.name ?? 'route'} | UTP Bus Tracker` }],
  }),
});

function EditRoutePage() {
  const { routeId } = Route.useParams();
  const { data: route } = useBusRoute(routeId);
  const { mutate: updateRoute, isPending: isUpdatingRoute } =
    useUpdateBusRoute();
  const navigate = useNavigate();

  const onSubmit = (values: BusRouteValues) =>
    updateRoute(
      { id: routeId, data: toBusRoutePayload(values) },
      { onSuccess: () => navigate({ to: '/admin' }) },
    );

  return (
    <>
      <Link
        to="/admin"
        className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1.5 text-sm"
      >
        <LuArrowLeft className="size-4" />
        All routes
      </Link>

      <Heading as="h1" size="page" className="mb-6">
        Edit {route.name}
      </Heading>

      <RouteForm
        key={route.updatedAt}
        route={route}
        onSubmit={onSubmit}
        isSaving={isUpdatingRoute}
      />
    </>
  );
}

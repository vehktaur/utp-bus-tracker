import { Link } from '@tanstack/react-router';
import { LuArrowUpDown, LuPencil } from '~/assets/icons';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import DataTable from '~/components/ui/data-table';
import { useBusRoutes } from '~/hooks';
import type { BusRoute, RouteDirection } from '~/types';
import { createAppColumnHelper, useAppTable } from '~/utils/tableFeatures';
import type {
  DataTableCellContext,
  DataTableHeaderContext,
} from '~/utils/tableFeatures';
import { tripDurationMinutes } from '~/utils/tracking';

const EMPTY_ROWS: BusRoute[] = [];

function NameHeader({ column }: DataTableHeaderContext<BusRoute, string>) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 uppercase"
      onClick={() => column.toggleSorting()}
    >
      Route <LuArrowUpDown className="size-3.5" />
    </button>
  );
}

function NameCell({ row }: DataTableCellContext<BusRoute, string>) {
  const { color, name } = row.original;

  return (
    <span className="flex items-center gap-2.5 font-medium">
      <span
        className="size-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      {name}
    </span>
  );
}

function DirectionCell({
  getValue,
}: DataTableCellContext<BusRoute, RouteDirection>) {
  const isToCampus = getValue() === 'to-campus';

  return (
    <Badge variant={isToCampus ? 'default' : 'outline'}>
      {isToCampus ? 'To campus' : 'From campus'}
    </Badge>
  );
}

function StopsCell({ row }: DataTableCellContext<BusRoute>) {
  return (
    <span>
      {row.original.stops.length}
      <span className="text-muted-foreground">
        {' '}
        · {tripDurationMinutes(row.original)} min
      </span>
    </span>
  );
}

function DeparturesCell({ row }: DataTableCellContext<BusRoute>) {
  return (
    <span className="flex max-w-xs flex-wrap gap-1">
      {row.original.departures.map((time) => (
        <span
          key={time}
          className="bg-muted rounded-md px-1.5 py-0.5 text-xs tabular-nums"
        >
          {time}
        </span>
      ))}
    </span>
  );
}

function ActionsCell({ row }: DataTableCellContext<BusRoute>) {
  return (
    <Button asChild variant="ghost" size="sm" className="ml-auto">
      <Link to="/admin/$routeId" params={{ routeId: row.original.id }}>
        <LuPencil />
        Edit
      </Link>
    </Button>
  );
}

const columnHelper = createAppColumnHelper<BusRoute>();

const columns = columnHelper.columns([
  columnHelper.accessor('name', { header: NameHeader, cell: NameCell }),
  columnHelper.accessor('direction', {
    header: 'Direction',
    cell: DirectionCell,
  }),
  columnHelper.display({ id: 'stops', header: 'Stops', cell: StopsCell }),
  columnHelper.display({
    id: 'departures',
    header: 'Departures',
    cell: DeparturesCell,
  }),
  columnHelper.display({ id: 'actions', cell: ActionsCell }),
]);

export default function RoutesTable() {
  const { data: routes = EMPTY_ROWS, isPending } = useBusRoutes();

  const table = useAppTable({
    data: routes,
    columns,
    getRowId: (row) => row.id,
  });

  return (
    <DataTable
      table={table}
      isPending={isPending}
      emptyText="No routes yet"
      className="bg-card overflow-hidden rounded-2xl border"
    />
  );
}

import {
  createSortedRowModel,
  createTableHook,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  tableFeatures,
} from '@tanstack/react-table';
import type {
  CellContext,
  HeaderContext,
  ReactTable,
  RowData,
} from '@tanstack/react-table';

export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic },
});

export type DataTableFeatures = typeof dataTableFeatures;

export const { useAppTable, createAppColumnHelper } = createTableHook({
  features: dataTableFeatures,
});

export type DataTableInstance<TData extends RowData> = ReactTable<
  DataTableFeatures,
  TData
>;

export type DataTableCellContext<
  TData extends RowData,
  TValue = unknown,
> = CellContext<DataTableFeatures, TData, TValue>;

export type DataTableHeaderContext<
  TData extends RowData,
  TValue = unknown,
> = HeaderContext<DataTableFeatures, TData, TValue>;

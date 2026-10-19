"use client";

import { Suspense, useState, type ReactNode } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type Table as TanstackTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fill } from "@/i18n/format";
import { useI18n } from "@/i18n/provider";
import { DataTableFacetedFilter, type FacetOption } from "./faceted-filter";
import { DataTablePagination } from "./pagination";
import { DataTableViewOptions } from "./view-options";

export type DataTableFilter = { columnId: string; title: string; options: FacetOption[] };

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Column the search box filters on. */
  searchColumn?: string;
  searchPlaceholder?: string;
  filters?: DataTableFilter[];
  initialFilters?: ColumnFiltersState;
  initialSorting?: SortingState;
  initialVisibility?: VisibilityState;
  /** Rendered in the floating bar while rows are selected. */
  bulkActions?: (table: TanstackTable<TData>) => ReactNode;
  /** Shown when the table has no rows at all, before any filtering. */
  empty?: ReactNode;
  getRowId?: (row: TData) => string;
};

/**
 * TanStack Table reads `Date.now()` while rendering (its memo timing), which
 * Cache Components may not bake into the static shell. The table therefore
 * streams in behind its own Suspense boundary, with a same-sized skeleton.
 */
export function DataTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
  return (
    <Suspense fallback={<DataTableSkeleton rows={Math.min(props.data.length, 10) || 5} />}>
      <DataTableInner {...props} />
    </Suspense>
  );
}

function DataTableSkeleton({ rows }: { rows: number }) {
  return (
    <div className="flex flex-col gap-4" aria-busy>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="space-y-px overflow-hidden rounded-lg border">
        {Array.from({ length: rows + 1 }, (_, index) => (
          <Skeleton key={index} className="h-12 rounded-none" />
        ))}
      </div>
    </div>
  );
}

function DataTableInner<TData, TValue>({
  columns,
  data,
  searchColumn,
  searchPlaceholder,
  filters = [],
  initialFilters = [],
  initialSorting = [],
  initialVisibility = {},
  bulkActions,
  empty,
  getRowId,
}: DataTableProps<TData, TValue>) {
  const { t } = useI18n();
  const searchLabel = searchPlaceholder ?? t.common.table.search;
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialFilters);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialVisibility);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection },
    getRowId,
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const isFiltered = columnFilters.length > 0;
  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  if (data.length === 0 && empty) return <>{empty}</>;

  return (
    <div className="relative flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {searchColumn && (
          <InputGroup className="h-8 w-full sm:w-64">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              aria-label={searchLabel}
              placeholder={searchLabel}
              value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""}
              onChange={(event) => table.getColumn(searchColumn)?.setFilterValue(event.target.value)}
            />
          </InputGroup>
        )}
        {filters.map((filter) =>
          table.getColumn(filter.columnId) ? (
            <DataTableFacetedFilter
              key={filter.columnId}
              column={table.getColumn(filter.columnId)}
              title={filter.title}
              options={filter.options}
            />
          ) : null,
        )}
        {isFiltered && (
          <Button variant="ghost" size="sm" onClick={() => table.resetColumnFilters()}>
            {t.common.table.reset} <X />
          </Button>
        )}
        <DataTableViewOptions table={table} />
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan} className="h-10">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                  {t.common.table.noMatches}{" "}
                  <Button variant="link" className="h-auto p-0" onClick={() => table.resetColumnFilters()}>
                    {t.common.table.clearFilters}
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />

      {/* Bulk actions rise from the bottom while rows are selected, and sink away when cleared. */}
      <AnimatePresence>
        {bulkActions && selectedCount > 0 && (
          <motion.div
            role="toolbar"
            aria-label={t.common.table.bulkActions}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0, transition: { duration: 0.12 } }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="sticky bottom-4 z-10 mx-auto flex w-fit max-w-full items-center gap-2 rounded-xl border bg-popover p-1.5 ps-3 shadow-lg"
          >
            <span className="tabular text-sm font-medium whitespace-nowrap">{fill(t.common.table.selected, { count: selectedCount })}</span>
            <span aria-hidden className="mx-1 h-5 w-px bg-border" />
            {bulkActions(table)}
            <Button variant="ghost" size="icon-sm" onClick={() => table.resetRowSelection()} aria-label={t.common.table.clearSelection}>
              <X />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

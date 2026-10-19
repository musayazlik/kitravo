"use client";

import type { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fill } from "@/i18n/format";
import { useI18n } from "@/i18n/provider";

export function DataTablePagination<TData>({ table }: { table: Table<TData> }) {
  const { t, plural } = useI18n();
  const { pageIndex, pageSize } = table.getState().pagination;
  const selected = table.getFilteredSelectedRowModel().rows.length;
  const total = table.getFilteredRowModel().rows.length;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1">
      <p className="text-sm text-muted-foreground">
        {selected > 0 ? fill(t.common.table.selectedOf, { selected, total }) : plural(t.common.table.rows, total)}
      </p>
      <div className="flex items-center gap-4 lg:gap-6">
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-sm text-muted-foreground">{t.common.table.rowsPerPage}</span>
          <Select value={`${pageSize}`} onValueChange={(value) => table.setPageSize(Number(value))}>
            <SelectTrigger size="sm" className="w-[4.5rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="tabular text-sm font-medium">
          {fill(t.common.table.pageOf, { page: pageIndex + 1, pages: Math.max(table.getPageCount(), 1) })}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon-sm" className="hidden lg:inline-flex" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} aria-label={t.common.table.firstPage}>
            <ChevronsLeft />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} aria-label={t.common.table.previousPage}>
            <ChevronLeft />
          </Button>
          <Button variant="outline" size="icon-sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} aria-label={t.common.table.nextPage}>
            <ChevronRight />
          </Button>
          <Button variant="outline" size="icon-sm" className="hidden lg:inline-flex" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} aria-label={t.common.table.lastPage}>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

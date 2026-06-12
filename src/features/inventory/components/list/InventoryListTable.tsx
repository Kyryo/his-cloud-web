"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type InventoryListTableColumn<T> = {
  key: string;
  label: string;
  headerClassName?: string;
  cellClassName?: string;
  render: (item: T) => ReactNode;
};

type InventoryListTableProps<T> = {
  items: T[];
  columns: InventoryListTableColumn<T>[];
  getRowKey: (item: T) => string;
  onRowClick?: (item: T) => void;
  footer?: ReactNode;
  className?: string;
  compact?: boolean;
};

export function InventoryListTable<T>({
  items,
  columns,
  getRowKey,
  onRowClick,
  footer,
  className,
  compact = false,
}: InventoryListTableProps<T>) {
  const cellPadding = compact ? "px-3 py-2" : "px-4 py-3";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-brand-border bg-white",
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-brand-border bg-slate-50/80">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    cellPadding,
                    "text-left text-sm font-medium text-brand-muted",
                    compact && "text-xs",
                    column.headerClassName,
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {items.map((item) => (
              <tr
                key={getRowKey(item)}
                className={cn(
                  onRowClick && "cursor-pointer transition-colors hover:bg-slate-50/80",
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      cellPadding,
                      "text-sm text-brand-slate",
                      compact && "text-[13px]",
                      column.cellClassName,
                    )}
                  >
                    {column.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footer ? (
        <div className={cn("border-t border-brand-border", compact ? "px-3 py-2" : "px-4 py-3")}>
          {footer}
        </div>
      ) : null}
    </div>
  );
}

type InventoryListPaginationProps = {
  page: number;
  pageSize: number;
  totalCount: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
};

export function InventoryListPagination({
  page,
  pageSize,
  totalCount,
  hasPrevious,
  hasNext,
  onPageChange,
  isLoading = false,
}: InventoryListPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-brand-muted">
        Showing {start}–{end} of {totalCount}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasPrevious || isLoading}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <span className="text-sm text-brand-slate">
          Page {page} of {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasNext || isLoading}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

"use client";

import type { ReactNode } from "react";

import {
  ListPageActiveFilters,
  ListPageFilterChip,
  ListPageSearchToolbar,
} from "@/features/app-shell/components/page-layout";
import type { LabOrderListUrlState } from "@/features/laboratory/utils/lab-order-list-url";
import {
  formatLabOrderPriorityLabel,
  formatLabOrderStatusLabel,
} from "@/features/laboratory/utils/format-lab-order";
import { cn } from "@/lib/utils";

export type LabOrderListToolbarProps = {
  accession: string;
  filters: LabOrderListUrlState;
  isLoading?: boolean;
  onAccessionChange: (value: string) => void;
  onAccessionSubmit: () => void;
  onClearAccession: () => void;
  onFiltersApply: (filters: LabOrderListUrlState) => void;
  trailing?: ReactNode;
  className?: string;
};

export function LabOrderListToolbar({
  accession,
  filters,
  isLoading = false,
  onAccessionChange,
  onAccessionSubmit,
  onClearAccession,
  onFiltersApply,
  trailing,
  className,
}: LabOrderListToolbarProps) {
  const hasStatus = Boolean(filters.status && filters.status !== "all");
  const hasPriority = Boolean(filters.priority && filters.priority !== "all");
  const hasDateFrom = Boolean(filters.dateFrom?.trim());
  const hasDateTo = Boolean(filters.dateTo?.trim());
  const hasAnyFilter = hasStatus || hasPriority || hasDateFrom || hasDateTo;

  return (
    <div className={cn("space-y-2", className)}>
      <ListPageSearchToolbar
        search={accession}
        placeholder="Search by accession number…"
        searchTestId="lab-orders-accession-search"
        isLoading={isLoading}
        onSearchChange={onAccessionChange}
        onSearchSubmit={onAccessionSubmit}
        onClearSearch={onClearAccession}
        trailing={trailing}
      />

      {hasAnyFilter ? (
        <ListPageActiveFilters
          onClearAll={() =>
            onFiltersApply({
              ...filters,
              status: "all",
              priority: "all",
              dateFrom: "",
              dateTo: "",
            })
          }
        >
          {hasStatus ? (
            <ListPageFilterChip
              label={`Status: ${formatLabOrderStatusLabel(filters.status)}`}
              onRemove={() => onFiltersApply({ ...filters, status: "all" })}
            />
          ) : null}
          {hasPriority ? (
            <ListPageFilterChip
              label={`Priority: ${formatLabOrderPriorityLabel(filters.priority)}`}
              onRemove={() => onFiltersApply({ ...filters, priority: "all" })}
            />
          ) : null}
          {hasDateFrom ? (
            <ListPageFilterChip
              label={`From: ${filters.dateFrom}`}
              onRemove={() => onFiltersApply({ ...filters, dateFrom: "" })}
            />
          ) : null}
          {hasDateTo ? (
            <ListPageFilterChip
              label={`To: ${filters.dateTo}`}
              onRemove={() => onFiltersApply({ ...filters, dateTo: "" })}
            />
          ) : null}
        </ListPageActiveFilters>
      ) : null}
    </div>
  );
}

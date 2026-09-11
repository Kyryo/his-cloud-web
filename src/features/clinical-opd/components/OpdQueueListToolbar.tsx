"use client";

import type { ReactNode } from "react";

import {
  ListPageActiveFilters,
  ListPageFilterChip,
  ListPageSearchToolbar,
} from "@/features/app-shell/components/page-layout";
import { OpdQueueFiltersDropdown } from "@/features/clinical-opd/components/OpdQueueFiltersDropdown";
import {
  countActiveOpdQueueFilters,
  DEFAULT_OPD_QUEUE_FILTERS,
  OPD_QUEUE_STATUS_OPTIONS,
  type OpdQueueListFilterState,
} from "@/features/clinical-opd/utils/opd-queue-list-filters";
import { cn } from "@/lib/utils";

export type OpdQueueListToolbarProps = {
  search: string;
  filters: OpdQueueListFilterState;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: OpdQueueListFilterState) => void;
  trailing?: ReactNode;
  className?: string;
};

export function OpdQueueListToolbar({
  search,
  filters,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onFiltersApply,
  trailing,
  className,
}: OpdQueueListToolbarProps) {
  const hasStatusFilter = filters.status !== "all";
  const hasAnyFilter = countActiveOpdQueueFilters(filters) > 0;

  const statusLabel =
    OPD_QUEUE_STATUS_OPTIONS.find((option) => option.value === filters.status)
      ?.label ?? filters.status;

  const handleRemoveStatus = () => {
    onFiltersApply({ ...filters, status: "all" });
  };

  const handleClearAllFilters = () => {
    onFiltersApply(DEFAULT_OPD_QUEUE_FILTERS);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <ListPageSearchToolbar
        search={search}
        searchId="opd-queue-search"
        placeholder="Search by name, ID, phone, or department…"
        searchTestId="opd-queue-search"
        searchSubmitTestId="opd-queue-search-submit"
        clearTestId="opd-queue-search-clear"
        isLoading={isLoading}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={onClearSearch}
        filter={
          <OpdQueueFiltersDropdown
            filters={filters}
            isLoading={isLoading}
            onApply={onFiltersApply}
          />
        }
        trailing={trailing}
      />

      {hasAnyFilter ? (
        <ListPageActiveFilters
          disabled={isLoading}
          onClearAll={handleClearAllFilters}
        >
          {hasStatusFilter ? (
            <ListPageFilterChip
              label={`Status: ${statusLabel}`}
              disabled={isLoading}
              onRemove={handleRemoveStatus}
            />
          ) : null}
        </ListPageActiveFilters>
      ) : null}
    </div>
  );
}

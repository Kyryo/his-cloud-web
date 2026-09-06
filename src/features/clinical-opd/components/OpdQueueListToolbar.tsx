"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

import { ListPageSearchToolbar } from "@/features/app-shell/components/page-layout";
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
        placeholder="Search by name, ID, phone, or department..."
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
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs">
          <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-dash-muted">
            Active filters:
          </span>

          {hasStatusFilter ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleRemoveStatus}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-blue-200 bg-blue-50/80 px-2.5 py-0.5 text-blue-800 transition-colors hover:bg-blue-100"
            >
              <span>Status: {statusLabel}</span>
              <X className="size-3" />
            </button>
          ) : null}

          <button
            type="button"
            disabled={isLoading}
            onClick={handleClearAllFilters}
            className="ml-1 text-[11px] font-medium text-brand-primary underline transition-colors hover:text-brand-primary-hover"
          >
            Clear all
          </button>
        </div>
      ) : null}
    </div>
  );
}

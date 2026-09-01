"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

import { ListPageSearchToolbar } from "@/features/app-shell/components/page-layout";
import { CustomerFiltersDropdown } from "@/features/customers/components/CustomerFiltersDropdown";
import {
  CUSTOMER_ORDERING_OPTIONS,
  DEFAULT_CUSTOMER_ORDERING,
  type CustomerListFilterState,
} from "@/features/customers/utils/customer-list-filters";
import { cn } from "@/lib/utils";

export type CustomerListToolbarProps = {
  search: string;
  filters: Pick<
    CustomerListFilterState,
    "gender" | "activeStatus" | "ordering" | "tags"
  >;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (
    filters: Pick<
      CustomerListFilterState,
      "gender" | "activeStatus" | "ordering" | "tags"
    >,
  ) => void;
  trailing?: ReactNode;
  className?: string;
};

export function CustomerListToolbar({
  search,
  filters,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onFiltersApply,
  trailing,
  className,
}: CustomerListToolbarProps) {
  const hasGenderFilter = filters.gender !== "all";
  const hasStatusFilter = filters.activeStatus !== "all";
  const hasOrderingFilter = filters.ordering !== DEFAULT_CUSTOMER_ORDERING;
  const hasTagsFilter = filters.tags.length > 0;
  const hasAnyFilter =
    hasGenderFilter || hasStatusFilter || hasOrderingFilter || hasTagsFilter;

  const orderingLabel =
    CUSTOMER_ORDERING_OPTIONS.find((opt) => opt.value === filters.ordering)
      ?.label ?? "Custom order";

  const handleRemoveGender = () => {
    onFiltersApply({ ...filters, gender: "all" });
  };

  const handleRemoveStatus = () => {
    onFiltersApply({ ...filters, activeStatus: "all" });
  };

  const handleRemoveOrdering = () => {
    onFiltersApply({ ...filters, ordering: DEFAULT_CUSTOMER_ORDERING });
  };

  const handleRemoveTags = () => {
    onFiltersApply({ ...filters, tags: [] });
  };

  const handleClearAllFilters = () => {
    onFiltersApply({
      gender: "all",
      activeStatus: "all",
      ordering: DEFAULT_CUSTOMER_ORDERING,
      tags: [],
    });
  };

  return (
    <div className={cn("space-y-2", className)}>
      <ListPageSearchToolbar
        search={search}
        searchId="customer-search"
        placeholder="Search by name, ID, phone, email, or internal reference..."
        searchTestId="customers-search"
        searchSubmitTestId="customers-search-submit"
        clearTestId="customers-search-clear"
        isLoading={isLoading}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={onClearSearch}
        filter={
          <CustomerFiltersDropdown
            filters={filters}
            isLoading={isLoading}
            onApply={onFiltersApply}
          />
        }
        trailing={trailing}
      />

      {/* Active Filter Chips Bar */}
      {hasAnyFilter ? (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-dash-muted mr-1">
            Active filters:
          </span>

          {hasGenderFilter ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleRemoveGender}
              className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50/80 px-2.5 py-0.5 text-blue-800 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <span>Gender: {filters.gender}</span>
              <X className="size-3" />
            </button>
          ) : null}

          {hasStatusFilter ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleRemoveStatus}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100/90 px-2.5 py-0.5 text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <span className="capitalize">Status: {filters.activeStatus}</span>
              <X className="size-3" />
            </button>
          ) : null}

          {hasOrderingFilter ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleRemoveOrdering}
              className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50/80 px-2.5 py-0.5 text-purple-800 hover:bg-purple-100 transition-colors cursor-pointer"
            >
              <span>Sort: {orderingLabel}</span>
              <X className="size-3" />
            </button>
          ) : null}

          {hasTagsFilter ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleRemoveTags}
              className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50/80 px-2.5 py-0.5 text-teal-800 hover:bg-teal-100 transition-colors cursor-pointer"
            >
              <span>{filters.tags.length} Tag{filters.tags.length > 1 ? "s" : ""}</span>
              <X className="size-3" />
            </button>
          ) : null}

          <button
            type="button"
            disabled={isLoading}
            onClick={handleClearAllFilters}
            className="ml-1 text-[11px] font-medium text-brand-primary underline hover:text-brand-primary-hover transition-colors"
          >
            Clear all
          </button>
        </div>
      ) : null}
    </div>
  );
}

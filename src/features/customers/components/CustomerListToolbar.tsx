"use client";

import type { ReactNode } from "react";

import {
  ListPageActiveFilters,
  ListPageFilterChip,
  ListPageSearchToolbar,
} from "@/features/app-shell/components/page-layout";
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
        placeholder="Search by name, ID, phone, email, or reference…"
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

      {hasAnyFilter ? (
        <ListPageActiveFilters
          disabled={isLoading}
          onClearAll={handleClearAllFilters}
        >
          {hasGenderFilter ? (
            <ListPageFilterChip
              label={`Gender: ${filters.gender}`}
              disabled={isLoading}
              onRemove={handleRemoveGender}
            />
          ) : null}
          {hasStatusFilter ? (
            <ListPageFilterChip
              label={`Status: ${filters.activeStatus}`}
              disabled={isLoading}
              className="capitalize"
              onRemove={handleRemoveStatus}
            />
          ) : null}
          {hasOrderingFilter ? (
            <ListPageFilterChip
              label={`Sort: ${orderingLabel}`}
              disabled={isLoading}
              onRemove={handleRemoveOrdering}
            />
          ) : null}
          {hasTagsFilter ? (
            <ListPageFilterChip
              label={`${filters.tags.length} tag${filters.tags.length > 1 ? "s" : ""}`}
              disabled={isLoading}
              onRemove={handleRemoveTags}
            />
          ) : null}
        </ListPageActiveFilters>
      ) : null}
    </div>
  );
}

"use client";

import { ListPageSearchToolbar } from "@/features/app-shell/components/page-layout";
import { ActiveVisitsFiltersSheet } from "@/features/visits/components/ActiveVisitsFiltersSheet";
import type { ActiveVisitListFilterState } from "@/features/visits/utils/visit-list-filters";

type ActiveVisitsListToolbarProps = {
  search: string;
  filters: ActiveVisitListFilterState;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: ActiveVisitListFilterState) => void;
};

export function ActiveVisitsListToolbar({
  search,
  filters,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onFiltersApply,
}: ActiveVisitsListToolbarProps) {
  return (
    <ListPageSearchToolbar
      search={search}
      searchId="active-visits-search"
      placeholder="Search by client, identifier, or service..."
      searchTestId="active-visits-search"
      searchSubmitTestId="active-visits-search-submit"
      clearTestId="active-visits-search-clear"
      isLoading={isLoading}
      onSearchChange={onSearchChange}
      onSearchSubmit={onSearchSubmit}
      onClearSearch={onClearSearch}
      filter={
        <ActiveVisitsFiltersSheet
          filters={filters}
          isLoading={isLoading}
          onApply={onFiltersApply}
        />
      }
    />
  );
}

"use client";

import { ListPageHeaderSection } from "@/features/app-shell/components/page-layout";
import { ActiveVisitsListToolbar } from "@/features/visits/components/ActiveVisitsListToolbar";
import type { ActiveVisitListFilterState } from "@/features/visits/utils/visit-list-filters";

type ActiveVisitsPageHeaderProps = {
  search: string;
  filters: ActiveVisitListFilterState;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: ActiveVisitListFilterState) => void;
};

export function ActiveVisitsPageHeader({
  search,
  filters,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onFiltersApply,
}: ActiveVisitsPageHeaderProps) {
  return (
    <ListPageHeaderSection>
      <ActiveVisitsListToolbar
        search={search}
        filters={filters}
        isLoading={isLoading}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={onClearSearch}
        onFiltersApply={onFiltersApply}
      />
    </ListPageHeaderSection>
  );
}

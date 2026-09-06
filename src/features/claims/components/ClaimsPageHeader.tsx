"use client";

import { ListPageHeaderSection } from "@/features/app-shell/components/page-layout";
import { ClaimListToolbar } from "@/features/claims/components/ClaimListToolbar";
import type { ClaimListFilterState } from "@/features/claims/utils/claim-list-filters";

type ClaimsPageHeaderProps = {
  search: string;
  filters: ClaimListFilterState;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: ClaimListFilterState) => void;
};

export function ClaimsPageHeader({
  search,
  filters,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onFiltersApply,
}: ClaimsPageHeaderProps) {
  return (
    <ListPageHeaderSection>
      <ClaimListToolbar
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

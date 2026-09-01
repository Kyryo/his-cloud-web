"use client";

import { ListPageSearchToolbar } from "@/features/app-shell/components/page-layout";
import { RejectionFiltersSheet } from "@/features/claims/components/RejectionFiltersSheet";
import type { RejectionListFilterState } from "@/features/claims/utils/rejection-list-filters";

type RejectionListToolbarProps = {
  search: string;
  filters: RejectionListFilterState;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: RejectionListFilterState) => void;
};

export function RejectionListToolbar({
  search,
  filters,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onFiltersApply,
}: RejectionListToolbarProps) {
  return (
    <ListPageSearchToolbar
      search={search}
      searchId="rejection-search"
      placeholder="Search patient, member #, invoice, claim #, code, reason, or remittance file..."
      searchTestId="rejections-search"
      searchSubmitTestId="rejections-search-submit"
      clearTestId="rejections-search-clear"
      isLoading={isLoading}
      onSearchChange={onSearchChange}
      onSearchSubmit={onSearchSubmit}
      onClearSearch={onClearSearch}
      filter={
        <RejectionFiltersSheet
          filters={filters}
          isLoading={isLoading}
          onApply={onFiltersApply}
        />
      }
    />
  );
}

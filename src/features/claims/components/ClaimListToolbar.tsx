"use client";

import { ListPageSearchToolbar } from "@/features/app-shell/components/page-layout";
import { ClaimFiltersSheet } from "@/features/claims/components/ClaimFiltersSheet";
import type { ClaimListFilterState } from "@/features/claims/utils/claim-list-filters";

type ClaimListToolbarProps = {
  search: string;
  filters: ClaimListFilterState;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: ClaimListFilterState) => void;
};

export function ClaimListToolbar(props: ClaimListToolbarProps) {
  const {
    search,
    filters,
    isLoading = false,
    onSearchChange,
    onSearchSubmit,
    onClearSearch,
    onFiltersApply,
  } = props;

  return (
    <ListPageSearchToolbar
      search={search}
      searchId="claim-search"
      placeholder="Search membership, patient, invoice, claim #, payer…"
      searchTestId="claims-search"
      searchSubmitTestId="claims-search-submit"
      clearTestId="claims-search-clear"
      isLoading={isLoading}
      onSearchChange={onSearchChange}
      onSearchSubmit={onSearchSubmit}
      onClearSearch={onClearSearch}
      filter={
        <ClaimFiltersSheet
          filters={filters}
          isLoading={isLoading}
          onApply={onFiltersApply}
        />
      }
    />
  );
}

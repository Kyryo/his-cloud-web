"use client";

import { ListPageSearchToolbar } from "@/features/app-shell/components/page-layout";
import { RemittanceRowsFiltersSheet } from "@/features/claims/components/RemittanceRowsFiltersSheet";
import type { RemittanceRowListFilterState } from "@/features/claims/utils/remittance-row-list-filters";

type RemittanceRowsToolbarProps = {
  search: string;
  filters: RemittanceRowListFilterState;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: RemittanceRowListFilterState) => void;
};

export function RemittanceRowsToolbar({
  search,
  filters,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onFiltersApply,
}: RemittanceRowsToolbarProps) {
  return (
    <ListPageSearchToolbar
      search={search}
      searchId="remittance-rows-search"
      placeholder="Search patient, member #, invoice, claim #, code, or reason..."
      searchTestId="remittance-rows-search"
      searchSubmitTestId="remittance-rows-search-submit"
      clearTestId="remittance-rows-search-clear"
      isLoading={isLoading}
      onSearchChange={onSearchChange}
      onSearchSubmit={onSearchSubmit}
      onClearSearch={onClearSearch}
      filter={
        <RemittanceRowsFiltersSheet
          filters={filters}
          isLoading={isLoading}
          onApply={onFiltersApply}
        />
      }
    />
  );
}

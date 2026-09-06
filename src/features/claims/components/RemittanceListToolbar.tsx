"use client";

import type { ReactNode } from "react";

import { ListPageSearchToolbar } from "@/features/app-shell/components/page-layout";
import { RemittanceFiltersSheet } from "@/features/claims/components/RemittanceFiltersSheet";
import type { RemittanceListFilterState } from "@/features/claims/utils/remittance-list-filters";

type RemittanceListToolbarProps = {
  search: string;
  filters: RemittanceListFilterState;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: RemittanceListFilterState) => void;
  trailing?: ReactNode;
};

export function RemittanceListToolbar({
  search,
  filters,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onFiltersApply,
  trailing,
}: RemittanceListToolbarProps) {
  return (
    <ListPageSearchToolbar
      search={search}
      searchId="remittance-search"
      placeholder="Search file name, payer, document #, or provider..."
      searchTestId="remittances-search"
      searchSubmitTestId="remittances-search-submit"
      clearTestId="remittances-search-clear"
      isLoading={isLoading}
      onSearchChange={onSearchChange}
      onSearchSubmit={onSearchSubmit}
      onClearSearch={onClearSearch}
      filter={
        <RemittanceFiltersSheet
          filters={filters}
          isLoading={isLoading}
          onApply={onFiltersApply}
        />
      }
      trailing={trailing}
    />
  );
}

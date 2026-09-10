"use client";

import { ListPageHeaderSection } from "@/features/app-shell/components/page-layout";
import { InventoryListSearchToolbar } from "@/features/inventory/components/InventoryListSearchToolbar";
import type { InventoryListSearchFilters } from "@/features/inventory/utils/inventory-list-filter-chips";

type StockPageHeaderProps = {
  search: string;
  filters: InventoryListSearchFilters;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: InventoryListSearchFilters) => void;
};

export function StockPageHeader({
  search,
  filters,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onFiltersApply,
}: StockPageHeaderProps) {
  return (
    <ListPageHeaderSection>
      <InventoryListSearchToolbar
        variant="stock"
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

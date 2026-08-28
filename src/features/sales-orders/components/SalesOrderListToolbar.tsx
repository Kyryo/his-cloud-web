"use client";

import { ListPageSearchToolbar } from "@/features/app-shell/components/page-layout";
import { SalesOrderFiltersSheet } from "@/features/sales-orders/components/SalesOrderFiltersSheet";
import type { SalesOrderListFilterState } from "@/features/sales-orders/utils/sales-order-list-filters";

type SalesOrderListToolbarProps = {
  search: string;
  filters: SalesOrderListFilterState;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: SalesOrderListFilterState) => void;
};

export function SalesOrderListToolbar({
  search,
  filters,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onFiltersApply,
}: SalesOrderListToolbarProps) {
  return (
    <ListPageSearchToolbar
      search={search}
      searchId="sales-order-search"
      placeholder="Search by order number, client, provider, or reference..."
      searchTestId="sales-orders-search"
      searchSubmitTestId="sales-orders-search-submit"
      clearTestId="sales-orders-search-clear"
      isLoading={isLoading}
      onSearchChange={onSearchChange}
      onSearchSubmit={onSearchSubmit}
      onClearSearch={onClearSearch}
      filter={
        <SalesOrderFiltersSheet
          filters={filters}
          isLoading={isLoading}
          onApply={onFiltersApply}
        />
      }
    />
  );
}

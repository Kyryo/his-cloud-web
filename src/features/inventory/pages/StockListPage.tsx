"use client";

import { Store } from "lucide-react";
import { useCallback, useState } from "react";

import {
  ListPageDataSectionsStack,
  ListPageLayout,
} from "@/features/app-shell/components/page-layout";
import { InventoryFiltersSheet } from "@/features/inventory/components/InventoryFiltersSheet";
import { InventoryListToolbar } from "@/features/inventory/components/InventoryListToolbar";
import { InventoryListAccessDenied } from "@/features/inventory/components/list/InventoryListAccessDenied";
import { InventoryListEmptyState } from "@/features/inventory/components/list/InventoryListEmptyState";
import { InventoryListPageContent } from "@/features/inventory/components/list/InventoryListPageContent";
import { InventoryListPageHeader } from "@/features/inventory/components/list/InventoryListPageHeader";
import { InventoryListPagination } from "@/features/inventory/components/list/InventoryListTable";
import { StockDetailDialog } from "@/features/inventory/components/StockDetailDialog";
import { StockTable } from "@/features/inventory/components/tables/stock-table";
import { useInventoryListFilters } from "@/features/inventory/hooks/use-inventory-list-filters";
import { fetchInventoryStock } from "@/features/inventory/services/inventory.service";
import type {
  InventoryListFilters,
  InventoryStock,
} from "@/features/inventory/types/inventory.types";
import {
  buildStockListFilters,
  countActiveStockFilters,
  DEFAULT_STOCK_SHEET_FILTERS,
} from "@/features/inventory/utils/inventory-list-filters";

export function StockListPage() {
  const [selectedStock, setSelectedStock] = useState<InventoryStock | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchFn = useCallback(
    (f: InventoryListFilters) => fetchInventoryStock(f),
    [],
  );

  const {
    items,
    totalCount,
    page,
    pageSize,
    search,
    isLoading,
    isRefreshing,
    error,
    isUnauthorized,
    hasNext,
    hasPrevious,
    hasNoRecords,
    isFilteredEmpty,
    setSearch,
    handleSearchSubmit,
    handleClearSearch,
    reload,
    handlePageChange,
    sheetFilters,
    handleFiltersApply,
  } = useInventoryListFilters({
    fetchFn,
    defaultSheetFilters: DEFAULT_STOCK_SHEET_FILTERS,
    buildExtraFilters: buildStockListFilters,
    countActiveSheetFilters: countActiveStockFilters,
  });

  const handleRowClick = useCallback((item: InventoryStock) => {
    setSelectedStock(item);
    setDetailOpen(true);
  }, []);

  const handleDetailOpenChange = useCallback((open: boolean) => {
    setDetailOpen(open);
  }, []);

  if (isUnauthorized) {
    return (
      <InventoryListAccessDenied message="You are not authorized to view inventory stock." />
    );
  }

  return (
    <ListPageLayout data-testid="inventory-stock-page">
      <StockDetailDialog
        stock={selectedStock}
        open={detailOpen}
        onOpenChange={handleDetailOpenChange}
      />

      <InventoryListPageHeader
        title="Inventory register"
        description="On-hand quantities by location and product."
        search={search}
        isSearchDisabled={isRefreshing}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        searchPlaceholder="Search by product, location, or batch..."
      />

      {!hasNoRecords ? (
        <ListPageDataSectionsStack>
          <InventoryListToolbar
            search={search}
            searchPlaceholder="Search by product, location, or batch..."
            isLoading={isRefreshing}
            onSearchChange={setSearch}
            onSearchSubmit={handleSearchSubmit}
            onClearSearch={handleClearSearch}
            filtersClassName="ml-auto flex justify-end"
            filters={
              <InventoryFiltersSheet
                variant="stock"
                filters={sheetFilters}
                isLoading={isRefreshing}
                onApply={(filters) => handleFiltersApply(filters as typeof sheetFilters)}
              />
            }
          />
        </ListPageDataSectionsStack>
      ) : null}

      <InventoryListPageContent
        isLoading={isLoading}
        loadingMessage="Loading stock..."
        error={error}
        onRetry={() => void reload()}
        errorTitle="Could not load stock"
        hasNoRecords={hasNoRecords}
        emptyState={
          <InventoryListEmptyState
            icon={Store}
            title="No stock records yet"
            description="Stock levels will appear here once inventory is received."
          />
        }
        isFilteredEmpty={isFilteredEmpty}
        filteredEmptyTitle="No matching stock records"
      >
        <StockTable items={items} onRowClick={handleRowClick} />
        <InventoryListPagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          isLoading={isRefreshing}
          onPageChange={handlePageChange}
        />
      </InventoryListPageContent>
    </ListPageLayout>
  );
}

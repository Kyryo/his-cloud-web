"use client";

import { ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { FabButton } from "@/components/ui/fab-button";
import { ROUTES } from "@/constants/routes";
import {
  ListPageLayout,
  ListPagePagination,
  ListPageStatsSection,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";
import { CreateStockAdjustmentDialog } from "@/features/inventory/components/CreateStockAdjustmentDialog";
import { InventoryListInsights } from "@/features/inventory/components/InventoryListInsights";
import {
  InventoryListPageHeaderBar,
  InventoryListPrimaryAction,
} from "@/features/inventory/components/InventoryListPageHeaderBar";
import { InventoryListAccessDenied } from "@/features/inventory/components/list/InventoryListAccessDenied";
import { InventoryListEmptyState } from "@/features/inventory/components/list/InventoryListEmptyState";
import { InventoryListFilteredEmpty } from "@/features/inventory/components/list/InventoryListFilteredEmpty";
import { InventoryTableSkeleton } from "@/features/inventory/components/tables/InventoryTableSkeleton";
import {
  STOCK_ADJUSTMENTS_TABLE_SKELETON_COLUMNS,
  StockAdjustmentsTable,
} from "@/features/inventory/components/tables/stock-adjustments-table";
import { useInventoryListFilters } from "@/features/inventory/hooks/use-inventory-list-filters";
import { fetchStockAdjustments } from "@/features/inventory/services/stock-adjustments.service";
import type {
  InventoryListFilters,
  StockAdjustment,
} from "@/features/inventory/types/inventory.types";
import { summarizeStockAdjustments } from "@/features/inventory/utils/inventory-document-insights";
import type { InventoryListSearchFilters } from "@/features/inventory/utils/inventory-list-filter-chips";
import {
  buildStockAdjustmentListFilters,
  countActiveStockAdjustmentFilters,
  DEFAULT_STOCK_ADJUSTMENT_SHEET_FILTERS,
  type StockAdjustmentSheetFilters,
} from "@/features/inventory/utils/inventory-list-filters";

export function StockAdjustmentsListPage() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const fetchFn = useCallback(
    (filters: InventoryListFilters) => fetchStockAdjustments(filters),
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
    defaultSheetFilters: DEFAULT_STOCK_ADJUSTMENT_SHEET_FILTERS,
    buildExtraFilters: buildStockAdjustmentListFilters,
    countActiveSheetFilters: countActiveStockAdjustmentFilters,
  });

  const insights = useMemo(
    () => summarizeStockAdjustments(items, totalCount),
    [items, totalCount],
  );

  const applyFilters = useCallback(
    (nextFilters: InventoryListSearchFilters) => {
      handleFiltersApply(nextFilters as StockAdjustmentSheetFilters);
    },
    [handleFiltersApply],
  );

  const handleClearSearchAndFilters = useCallback(() => {
    handleClearSearch();
    handleFiltersApply(DEFAULT_STOCK_ADJUSTMENT_SHEET_FILTERS);
  }, [handleClearSearch, handleFiltersApply]);

  const handleCreate = useCallback(() => {
    setCreateOpen(true);
  }, []);

  const handleRowClick = useCallback(
    (adjustment: StockAdjustment) =>
      router.push(ROUTES.inventoryStockAdjustmentDetail(adjustment.uuid)),
    [router],
  );

  if (isUnauthorized) {
    return <InventoryListAccessDenied />;
  }

  return (
    <ListPageLayout data-testid="inventory-stock-adjustments-page">
      <CreateStockAdjustmentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(adjustment) =>
          router.push(
            `${ROUTES.inventoryStockAdjustmentDetail(adjustment.uuid)}?add-lines=1`,
          )
        }
      />

      <InventoryListPageHeaderBar
        variant="stock-adjustments"
        search={search}
        filters={sheetFilters}
        isLoading={isRefreshing}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        onFiltersApply={applyFilters}
        trailing={
          <InventoryListPrimaryAction
            label="New Adjustment"
            onClick={handleCreate}
            data-testid="add-stock-adjustment-button"
          />
        }
      />

      <FabButton
        label="New adjustment"
        onClick={handleCreate}
        data-testid="add-stock-adjustment-fab"
      />

      {!hasNoRecords && !error && !isFilteredEmpty ? (
        <ListPageStatsSection>
          <InventoryListInsights
            cards={insights}
            isLoading={isLoading}
            data-testid="stock-adjustment-insights"
          />
        </ListPageStatsSection>
      ) : null}

      <ListPageTableSection>
        {isLoading ? (
          <InventoryTableSkeleton
            columns={STOCK_ADJUSTMENTS_TABLE_SKELETON_COLUMNS}
          />
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-sm font-semibold text-red-800">
              Could not load stock adjustments
            </h2>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => void reload()}
            >
              Try again
            </Button>
          </div>
        ) : hasNoRecords ? (
          <InventoryListEmptyState
            icon={ClipboardList}
            title="No stock adjustments yet"
            description="Create an adjustment to correct inventory quantities or costs."
            actionLabel="New adjustment"
            onAction={handleCreate}
          />
        ) : isFilteredEmpty ? (
          <InventoryListFilteredEmpty
            title="No matching stock adjustments"
            onClear={handleClearSearchAndFilters}
          />
        ) : (
          <>
            <StockAdjustmentsTable
              adjustments={items}
              onRowClick={handleRowClick}
            />
            <ListPagePagination
              page={page}
              pageSize={pageSize}
              totalCount={totalCount}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
              isLoading={isRefreshing}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </ListPageTableSection>
    </ListPageLayout>
  );
}

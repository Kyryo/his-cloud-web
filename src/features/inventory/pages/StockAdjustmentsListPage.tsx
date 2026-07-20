"use client";

import { ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { FabButton } from "@/components/ui/fab-button";
import { ROUTES } from "@/constants/routes";
import {
  ListPageDataSectionsStack,
  ListPageLayout,
} from "@/features/app-shell/components/page-layout";
import { CreateStockAdjustmentDialog } from "@/features/inventory/components/CreateStockAdjustmentDialog";
import { InventoryFiltersSheet } from "@/features/inventory/components/InventoryFiltersSheet";
import { InventoryListToolbar } from "@/features/inventory/components/InventoryListToolbar";
import { InventoryListAccessDenied } from "@/features/inventory/components/list/InventoryListAccessDenied";
import { InventoryListEmptyState } from "@/features/inventory/components/list/InventoryListEmptyState";
import { InventoryListPageContent } from "@/features/inventory/components/list/InventoryListPageContent";
import { InventoryListPageHeader } from "@/features/inventory/components/list/InventoryListPageHeader";
import { InventoryListPagination } from "@/features/inventory/components/list/InventoryListTable";
import { StockAdjustmentsTable } from "@/features/inventory/components/tables/stock-adjustments-table";
import { useInventoryListFilters } from "@/features/inventory/hooks/use-inventory-list-filters";
import { fetchStockAdjustments } from "@/features/inventory/services/stock-adjustments.service";
import type {
  InventoryListFilters,
  StockAdjustment,
} from "@/features/inventory/types/inventory.types";
import {
  buildStockAdjustmentListFilters,
  countActiveStockAdjustmentFilters,
  DEFAULT_STOCK_ADJUSTMENT_SHEET_FILTERS,
} from "@/features/inventory/utils/inventory-list-filters";

export function StockAdjustmentsListPage() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const fetchFn = useCallback(
    (f: InventoryListFilters) => fetchStockAdjustments(f),
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

      <InventoryListPageHeader
        title="Stock adjustments"
        description="Correct on-hand quantities and costs."
        addLabel="New adjustment"
        onAdd={handleCreate}
        search={search}
        isSearchDisabled={isRefreshing}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        searchPlaceholder="Search by reference, reason, or notes..."
        data-testid="add-stock-adjustment-button"
      />

      <FabButton
        label="New adjustment"
        onClick={handleCreate}
        data-testid="add-stock-adjustment-fab"
      />

      {!hasNoRecords ? (
        <ListPageDataSectionsStack>
          <InventoryListToolbar
            search={search}
            searchPlaceholder="Search by reference, reason, or notes..."
            isLoading={isRefreshing}
            onSearchChange={setSearch}
            onSearchSubmit={handleSearchSubmit}
            onClearSearch={handleClearSearch}
            filters={
              <InventoryFiltersSheet
                variant="stock-adjustments"
                filters={sheetFilters}
                isLoading={isRefreshing}
                onApply={(filters) =>
                  handleFiltersApply(filters as typeof sheetFilters)
                }
              />
            }
          />
        </ListPageDataSectionsStack>
      ) : null}

      <InventoryListPageContent
        isLoading={isLoading}
        loadingMessage="Loading stock adjustments..."
        error={error}
        onRetry={() => void reload()}
        errorTitle="Could not load stock adjustments"
        hasNoRecords={hasNoRecords}
        emptyState={
          <InventoryListEmptyState
            icon={ClipboardList}
            title="No stock adjustments yet"
            description="Create an adjustment to correct inventory quantities or costs."
            actionLabel="New adjustment"
            onAction={handleCreate}
          />
        }
        isFilteredEmpty={isFilteredEmpty}
        filteredEmptyTitle="No matching stock adjustments"
      >
        <StockAdjustmentsTable
          adjustments={items}
          onRowClick={handleRowClick}
        />
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

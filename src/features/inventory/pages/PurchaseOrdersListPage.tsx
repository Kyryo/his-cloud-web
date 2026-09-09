"use client";

import { FileText } from "lucide-react";
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
import { CreatePurchaseOrderDialog } from "@/features/inventory/components/CreatePurchaseOrderDialog";
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
  PURCHASE_ORDERS_TABLE_SKELETON_COLUMNS,
  PurchaseOrdersTable,
} from "@/features/inventory/components/tables/purchase-orders-table";
import { useInventoryListFilters } from "@/features/inventory/hooks/use-inventory-list-filters";
import { fetchPurchaseOrders } from "@/features/inventory/services/purchase-orders.service";
import type {
  InventoryListFilters,
  PurchaseOrder,
} from "@/features/inventory/types/inventory.types";
import { summarizePurchaseOrders } from "@/features/inventory/utils/inventory-document-insights";
import type { InventoryListSearchFilters } from "@/features/inventory/utils/inventory-list-filter-chips";
import {
  buildPurchaseOrderListFilters,
  countActivePurchaseOrderFilters,
  DEFAULT_PURCHASE_ORDER_SHEET_FILTERS,
  type PurchaseOrderSheetFilters,
} from "@/features/inventory/utils/inventory-list-filters";

export function PurchaseOrdersListPage() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const fetchFn = useCallback(
    (filters: InventoryListFilters) => fetchPurchaseOrders(filters),
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
    defaultSheetFilters: DEFAULT_PURCHASE_ORDER_SHEET_FILTERS,
    buildExtraFilters: buildPurchaseOrderListFilters,
    countActiveSheetFilters: countActivePurchaseOrderFilters,
  });

  const insights = useMemo(
    () => summarizePurchaseOrders(items, totalCount),
    [items, totalCount],
  );

  const applyFilters = useCallback(
    (nextFilters: InventoryListSearchFilters) => {
      handleFiltersApply(nextFilters as PurchaseOrderSheetFilters);
    },
    [handleFiltersApply],
  );

  const handleClearSearchAndFilters = useCallback(() => {
    handleClearSearch();
    handleFiltersApply(DEFAULT_PURCHASE_ORDER_SHEET_FILTERS);
  }, [handleClearSearch, handleFiltersApply]);

  const handleCreate = useCallback(() => {
    setCreateOpen(true);
  }, []);

  const handleRowClick = useCallback(
    (order: PurchaseOrder) =>
      router.push(ROUTES.inventoryPurchaseOrderDetail(order.uuid)),
    [router],
  );

  if (isUnauthorized) {
    return <InventoryListAccessDenied />;
  }

  return (
    <ListPageLayout data-testid="inventory-purchase-orders-page">
      <CreatePurchaseOrderDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(order) =>
          router.push(
            `${ROUTES.inventoryPurchaseOrderDetail(order.uuid)}?add-lines=1`,
          )
        }
      />

      <InventoryListPageHeaderBar
        variant="purchase-orders"
        search={search}
        filters={sheetFilters}
        isLoading={isRefreshing}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        onFiltersApply={applyFilters}
        trailing={
          <InventoryListPrimaryAction
            label="New Purchase Order"
            onClick={handleCreate}
            data-testid="add-purchase-order-button"
          />
        }
      />

      <FabButton
        label="New purchase order"
        onClick={handleCreate}
        data-testid="add-purchase-order-fab"
      />

      {!hasNoRecords && !error && !isFilteredEmpty ? (
        <ListPageStatsSection>
          <InventoryListInsights
            cards={insights}
            isLoading={isLoading}
            data-testid="purchase-order-insights"
          />
        </ListPageStatsSection>
      ) : null}

      <ListPageTableSection>
        {isLoading ? (
          <InventoryTableSkeleton columns={PURCHASE_ORDERS_TABLE_SKELETON_COLUMNS} />
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-sm font-semibold text-red-800">
              Could not load purchase orders
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
            icon={FileText}
            title="No purchase orders yet"
            description="Create a purchase order to receive stock from vendors."
            actionLabel="New purchase order"
            onAction={handleCreate}
          />
        ) : isFilteredEmpty ? (
          <InventoryListFilteredEmpty
            title="No matching purchase orders"
            onClear={handleClearSearchAndFilters}
          />
        ) : (
          <>
            <PurchaseOrdersTable orders={items} onRowClick={handleRowClick} />
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

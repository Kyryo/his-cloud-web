"use client";

import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { FabButton } from "@/components/ui/fab-button";
import { ROUTES } from "@/constants/routes";
import {
  ListPageDataSectionsStack,
  ListPageLayout,
} from "@/features/app-shell/components/page-layout";
import { CreatePurchaseOrderDialog } from "@/features/inventory/components/CreatePurchaseOrderDialog";
import { InventoryFiltersSheet } from "@/features/inventory/components/InventoryFiltersSheet";
import { InventoryListToolbar } from "@/features/inventory/components/InventoryListToolbar";
import { InventoryListAccessDenied } from "@/features/inventory/components/list/InventoryListAccessDenied";
import { InventoryListEmptyState } from "@/features/inventory/components/list/InventoryListEmptyState";
import { InventoryListPageContent } from "@/features/inventory/components/list/InventoryListPageContent";
import { InventoryListPageHeader } from "@/features/inventory/components/list/InventoryListPageHeader";
import { InventoryListPagination } from "@/features/inventory/components/list/InventoryListTable";
import { PurchaseOrdersTable } from "@/features/inventory/components/tables/purchase-orders-table";
import { useInventoryListFilters } from "@/features/inventory/hooks/use-inventory-list-filters";
import { fetchPurchaseOrders } from "@/features/inventory/services/purchase-orders.service";
import type {
  InventoryListFilters,
  PurchaseOrder,
} from "@/features/inventory/types/inventory.types";
import {
  buildPurchaseOrderListFilters,
  countActivePurchaseOrderFilters,
  DEFAULT_PURCHASE_ORDER_SHEET_FILTERS,
} from "@/features/inventory/utils/inventory-list-filters";

export function PurchaseOrdersListPage() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const fetchFn = useCallback(
    (f: InventoryListFilters) => fetchPurchaseOrders(f),
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

  const handleCreate = useCallback(() => {
    setCreateOpen(true);
  }, []);

  const handleRowClick = useCallback(
    (order: PurchaseOrder) => router.push(ROUTES.inventoryPurchaseOrderDetail(order.uuid)),
    [router],
  );

  if (isUnauthorized) {
    return <InventoryListAccessDenied />;
  }

  return (
    <ListPageLayout className="space-y-4" data-testid="inventory-purchase-orders-page">
      <CreatePurchaseOrderDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(order) =>
          router.push(`${ROUTES.inventoryPurchaseOrderDetail(order.uuid)}?add-lines=1`)
        }
      />

      <InventoryListPageHeader
        title="Purchase orders"
        description="Manage inbound stock from vendors."
        addLabel="New purchase order"
        onAdd={handleCreate}
        search={search}
        isSearchDisabled={isRefreshing}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        searchPlaceholder="Search by reference, vendor, LPO, or GRN..."
        data-testid="add-purchase-order-button"
      />

      <FabButton
        label="New purchase order"
        onClick={handleCreate}
        data-testid="add-purchase-order-fab"
      />

      {!hasNoRecords ? (
        <ListPageDataSectionsStack className="space-y-2">
          <InventoryListToolbar
            search={search}
            searchPlaceholder="Search by reference, vendor, LPO, or GRN..."
            isLoading={isRefreshing}
            onSearchChange={setSearch}
            onSearchSubmit={handleSearchSubmit}
            onClearSearch={handleClearSearch}
            compact
            filters={
              <InventoryFiltersSheet
                variant="purchase-orders"
                filters={sheetFilters}
                isLoading={isRefreshing}
                onApply={handleFiltersApply}
              />
            }
          />
        </ListPageDataSectionsStack>
      ) : null}

      <InventoryListPageContent
        isLoading={isLoading}
        loadingMessage="Loading purchase orders..."
        error={error}
        onRetry={() => void reload()}
        errorTitle="Could not load purchase orders"
        hasNoRecords={hasNoRecords}
        emptyState={
          <InventoryListEmptyState
            icon={FileText}
            title="No purchase orders yet"
            description="Create a purchase order to receive stock from vendors."
            actionLabel="New purchase order"
            onAction={handleCreate}
          />
        }
        isFilteredEmpty={isFilteredEmpty}
        filteredEmptyTitle="No matching purchase orders"
      >
        <div className="space-y-2">
          <PurchaseOrdersTable orders={items} onRowClick={handleRowClick} compact />
          <InventoryListPagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          isLoading={isRefreshing}
          onPageChange={handlePageChange}
        />
        </div>
      </InventoryListPageContent>
    </ListPageLayout>
  );
}

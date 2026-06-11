"use client";

import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { AddActionButton } from "@/components/ui/app-buttons";
import { FabButton } from "@/components/ui/fab-button";
import { ROUTES } from "@/constants/routes";
import {
  ListPageDataSectionsStack,
  ListPageLayout,
} from "@/features/app-shell/components/page-layout";
import { CreatePurchaseOrderDialog } from "@/features/inventory/components/CreatePurchaseOrderDialog";
import { InventoryListToolbar } from "@/features/inventory/components/InventoryListToolbar";
import { InventoryListAccessDenied } from "@/features/inventory/components/list/InventoryListAccessDenied";
import { InventoryListEmptyState } from "@/features/inventory/components/list/InventoryListEmptyState";
import { InventoryListPageContent } from "@/features/inventory/components/list/InventoryListPageContent";
import { InventoryListPageHeader } from "@/features/inventory/components/list/InventoryListPageHeader";
import { InventoryListPagination } from "@/features/inventory/components/list/InventoryListTable";
import { PurchaseOrdersTable } from "@/features/inventory/components/tables/purchase-orders-table";
import { useInventoryList } from "@/features/inventory/hooks/use-inventory-list";
import { fetchPurchaseOrders } from "@/features/inventory/services/purchase-orders.service";
import type {
  InventoryListFilters,
  PurchaseOrder,
} from "@/features/inventory/types/inventory.types";

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
    isLoading,
    isRefreshing,
    error,
    isUnauthorized,
    hasNext,
    hasPrevious,
    hasNoRecords,
    isFilteredEmpty,
    reload,
    handlePageChange,
  } = useInventoryList<PurchaseOrder>({ fetchFn });

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
    <ListPageLayout data-testid="inventory-purchase-orders-page">
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
        data-testid="add-purchase-order-button"
      />

      <FabButton
        label="New purchase order"
        onClick={handleCreate}
        data-testid="add-purchase-order-fab"
      />

      {!hasNoRecords ? (
        <ListPageDataSectionsStack>
          <InventoryListToolbar
            showSearch={false}
            isLoading={isRefreshing}
            onRefresh={() => void reload()}
            primaryAction={
              <AddActionButton
                label="New purchase order"
                className="hidden sm:inline-flex"
                onClick={handleCreate}
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
      >
        <PurchaseOrdersTable orders={items} onRowClick={handleRowClick} />
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

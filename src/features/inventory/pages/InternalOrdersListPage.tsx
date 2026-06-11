"use client";

import { Shuffle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { AddActionButton } from "@/components/ui/app-buttons";
import { FabButton } from "@/components/ui/fab-button";
import { ROUTES } from "@/constants/routes";
import {
  ListPageDataSectionsStack,
  ListPageLayout,
} from "@/features/app-shell/components/page-layout";
import { CreateInternalOrderDialog } from "@/features/inventory/components/CreateInternalOrderDialog";
import { InventoryListToolbar } from "@/features/inventory/components/InventoryListToolbar";
import { InventoryListAccessDenied } from "@/features/inventory/components/list/InventoryListAccessDenied";
import { InventoryListEmptyState } from "@/features/inventory/components/list/InventoryListEmptyState";
import { InventoryListPageContent } from "@/features/inventory/components/list/InventoryListPageContent";
import { InventoryListPageHeader } from "@/features/inventory/components/list/InventoryListPageHeader";
import { InventoryListPagination } from "@/features/inventory/components/list/InventoryListTable";
import { InternalOrdersTable } from "@/features/inventory/components/tables/internal-orders-table";
import { useInventoryList } from "@/features/inventory/hooks/use-inventory-list";
import { fetchInternalOrders } from "@/features/inventory/services/internal-orders.service";
import type {
  InternalOrder,
  InventoryListFilters,
} from "@/features/inventory/types/inventory.types";

export function InternalOrdersListPage() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const fetchFn = useCallback(
    (f: InventoryListFilters) => fetchInternalOrders(f),
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
  } = useInventoryList<InternalOrder>({ fetchFn });

  const handleCreate = useCallback(() => {
    setCreateOpen(true);
  }, []);

  const handleRowClick = useCallback(
    (order: InternalOrder) => router.push(ROUTES.inventoryInternalOrderDetail(order.uuid)),
    [router],
  );

  if (isUnauthorized) {
    return <InventoryListAccessDenied />;
  }

  return (
    <ListPageLayout data-testid="inventory-internal-orders-page">
      <CreateInternalOrderDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(order) => router.push(ROUTES.inventoryInternalOrderDetail(order.uuid))}
      />

      <InventoryListPageHeader
        title="Internal orders"
        description="Transfer stock between locations."
        addLabel="New internal order"
        onAdd={handleCreate}
        data-testid="add-internal-order-button"
      />

      <FabButton
        label="New internal order"
        onClick={handleCreate}
        data-testid="add-internal-order-fab"
      />

      {!hasNoRecords ? (
        <ListPageDataSectionsStack>
          <InventoryListToolbar
            showSearch={false}
            isLoading={isRefreshing}
            onRefresh={() => void reload()}
            primaryAction={
              <AddActionButton
                label="New internal order"
                className="hidden sm:inline-flex"
                onClick={handleCreate}
              />
            }
          />
        </ListPageDataSectionsStack>
      ) : null}

      <InventoryListPageContent
        isLoading={isLoading}
        loadingMessage="Loading internal orders..."
        error={error}
        onRetry={() => void reload()}
        errorTitle="Could not load internal orders"
        hasNoRecords={hasNoRecords}
        emptyState={
          <InventoryListEmptyState
            icon={Shuffle}
            title="No internal orders yet"
            description="Create an internal order to transfer stock between locations."
            actionLabel="New internal order"
            onAction={handleCreate}
          />
        }
        isFilteredEmpty={isFilteredEmpty}
      >
        <InternalOrdersTable orders={items} onRowClick={handleRowClick} />
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

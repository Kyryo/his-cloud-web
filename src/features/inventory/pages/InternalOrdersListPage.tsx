"use client";

import { Shuffle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { FabButton } from "@/components/ui/fab-button";
import { ROUTES } from "@/constants/routes";
import {
  ListPageDataSectionsStack,
  ListPageLayout,
} from "@/features/app-shell/components/page-layout";
import { CreateInternalOrderDialog } from "@/features/inventory/components/CreateInternalOrderDialog";
import { InventoryFiltersSheet } from "@/features/inventory/components/InventoryFiltersSheet";
import { InventoryListToolbar } from "@/features/inventory/components/InventoryListToolbar";
import { InventoryListAccessDenied } from "@/features/inventory/components/list/InventoryListAccessDenied";
import { InventoryListEmptyState } from "@/features/inventory/components/list/InventoryListEmptyState";
import { InventoryListPageContent } from "@/features/inventory/components/list/InventoryListPageContent";
import { InventoryListPageHeader } from "@/features/inventory/components/list/InventoryListPageHeader";
import { InventoryListPagination } from "@/features/inventory/components/list/InventoryListTable";
import { InternalOrdersTable } from "@/features/inventory/components/tables/internal-orders-table";
import { useInventoryListFilters } from "@/features/inventory/hooks/use-inventory-list-filters";
import { fetchInternalOrders } from "@/features/inventory/services/internal-orders.service";
import type {
  InternalOrder,
  InventoryListFilters,
} from "@/features/inventory/types/inventory.types";
import {
  buildInternalOrderListFilters,
  countActiveInternalOrderFilters,
  DEFAULT_INTERNAL_ORDER_SHEET_FILTERS,
} from "@/features/inventory/utils/inventory-list-filters";

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
    defaultSheetFilters: DEFAULT_INTERNAL_ORDER_SHEET_FILTERS,
    buildExtraFilters: buildInternalOrderListFilters,
    countActiveSheetFilters: countActiveInternalOrderFilters,
  });

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
    <ListPageLayout className="space-y-4" data-testid="inventory-internal-orders-page">
      <CreateInternalOrderDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(order) =>
          router.push(`${ROUTES.inventoryInternalOrderDetail(order.uuid)}?add-lines=1`)
        }
      />

      <InventoryListPageHeader
        title="Internal orders"
        description="Transfer stock between locations."
        addLabel="New internal order"
        onAdd={handleCreate}
        search={search}
        isSearchDisabled={isRefreshing}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        searchPlaceholder="Search by reference or notes..."
        data-testid="add-internal-order-button"
      />

      <FabButton
        label="New internal order"
        onClick={handleCreate}
        data-testid="add-internal-order-fab"
      />

      {!hasNoRecords ? (
        <ListPageDataSectionsStack className="space-y-2">
          <InventoryListToolbar
            search={search}
            searchPlaceholder="Search by reference or notes..."
            isLoading={isRefreshing}
            onSearchChange={setSearch}
            onSearchSubmit={handleSearchSubmit}
            onClearSearch={handleClearSearch}
            compact
            filters={
              <InventoryFiltersSheet
                variant="internal-orders"
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
        filteredEmptyTitle="No matching internal orders"
      >
        <div className="space-y-2">
          <InternalOrdersTable orders={items} onRowClick={handleRowClick} compact />
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

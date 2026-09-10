"use client";

import { Shuffle } from "lucide-react";
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
import { CreateInternalOrderDialog } from "@/features/inventory/components/CreateInternalOrderDialog";
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
  INTERNAL_ORDERS_TABLE_SKELETON_COLUMNS,
  InternalOrdersTable,
} from "@/features/inventory/components/tables/internal-orders-table";
import { useInventoryListFilters } from "@/features/inventory/hooks/use-inventory-list-filters";
import { fetchInternalOrders } from "@/features/inventory/services/internal-orders.service";
import type {
  InternalOrder,
  InventoryListFilters,
} from "@/features/inventory/types/inventory.types";
import { summarizeInternalOrders } from "@/features/inventory/utils/inventory-document-insights";
import type { InventoryListSearchFilters } from "@/features/inventory/utils/inventory-list-filter-chips";
import {
  buildInternalOrderListFilters,
  countActiveInternalOrderFilters,
  DEFAULT_INTERNAL_ORDER_SHEET_FILTERS,
  type InternalOrderSheetFilters,
} from "@/features/inventory/utils/inventory-list-filters";

export function InternalOrdersListPage() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const fetchFn = useCallback(
    (filters: InventoryListFilters) => fetchInternalOrders(filters),
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

  const insights = useMemo(
    () => summarizeInternalOrders(items, totalCount),
    [items, totalCount],
  );

  const applyFilters = useCallback(
    (nextFilters: InventoryListSearchFilters) => {
      handleFiltersApply(nextFilters as InternalOrderSheetFilters);
    },
    [handleFiltersApply],
  );

  const handleClearSearchAndFilters = useCallback(() => {
    handleClearSearch();
    handleFiltersApply(DEFAULT_INTERNAL_ORDER_SHEET_FILTERS);
  }, [handleClearSearch, handleFiltersApply]);

  const handleCreate = useCallback(() => {
    setCreateOpen(true);
  }, []);

  const handleRowClick = useCallback(
    (order: InternalOrder) =>
      router.push(ROUTES.inventoryInternalOrderDetail(order.uuid)),
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
        onCreated={(order) =>
          router.push(
            `${ROUTES.inventoryInternalOrderDetail(order.uuid)}?add-lines=1`,
          )
        }
      />

      <InventoryListPageHeaderBar
        variant="internal-orders"
        search={search}
        filters={sheetFilters}
        isLoading={isRefreshing}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        onFiltersApply={applyFilters}
        trailing={
          <InventoryListPrimaryAction
            label="New Internal Order"
            onClick={handleCreate}
            data-testid="add-internal-order-button"
          />
        }
      />

      <FabButton
        label="New internal order"
        onClick={handleCreate}
        data-testid="add-internal-order-fab"
      />

      {!hasNoRecords && !error && !isFilteredEmpty ? (
        <ListPageStatsSection>
          <InventoryListInsights
            cards={insights}
            isLoading={isLoading}
            data-testid="internal-order-insights"
          />
        </ListPageStatsSection>
      ) : null}

      <ListPageTableSection>
        {isLoading ? (
          <InventoryTableSkeleton columns={INTERNAL_ORDERS_TABLE_SKELETON_COLUMNS} />
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-sm font-semibold text-red-800">
              Could not load internal orders
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
            icon={Shuffle}
            title="No internal orders yet"
            description="Create an internal order to transfer stock between locations."
            actionLabel="New internal order"
            onAction={handleCreate}
          />
        ) : isFilteredEmpty ? (
          <InventoryListFilteredEmpty
            title="No matching internal orders"
            onClear={handleClearSearchAndFilters}
          />
        ) : (
          <>
            <InternalOrdersTable orders={items} onRowClick={handleRowClick} />
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

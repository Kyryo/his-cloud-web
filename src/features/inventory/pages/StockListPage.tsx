"use client";

import { Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { ROUTES } from "@/constants/routes";
import {
  ListPageDataSectionsStack,
  ListPageLayout,
} from "@/features/app-shell/components/page-layout";
import { InventoryListToolbar } from "@/features/inventory/components/InventoryListToolbar";
import { InventoryListAccessDenied } from "@/features/inventory/components/list/InventoryListAccessDenied";
import { InventoryListEmptyState } from "@/features/inventory/components/list/InventoryListEmptyState";
import { InventoryListPageContent } from "@/features/inventory/components/list/InventoryListPageContent";
import { InventoryListPageHeader } from "@/features/inventory/components/list/InventoryListPageHeader";
import { InventoryListPagination } from "@/features/inventory/components/list/InventoryListTable";
import { StockTable } from "@/features/inventory/components/tables/stock-table";
import { useInventoryList } from "@/features/inventory/hooks/use-inventory-list";
import { fetchInventoryStock } from "@/features/inventory/services/inventory.service";
import type {
  InventoryListFilters,
  InventoryStock,
} from "@/features/inventory/types/inventory.types";

export function StockListPage() {
  const router = useRouter();
  const fetchFn = useCallback(
    (f: InventoryListFilters) => fetchInventoryStock(f),
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
  } = useInventoryList<InventoryStock>({ fetchFn });

  const handleRowClick = useCallback(
    (item: InventoryStock) => router.push(ROUTES.inventoryStockDetail(item.uuid)),
    [router],
  );

  if (isUnauthorized) {
    return (
      <InventoryListAccessDenied message="You are not authorized to view inventory stock." />
    );
  }

  return (
    <ListPageLayout data-testid="inventory-stock-page">
      <InventoryListPageHeader
        title="Stock"
        description="On-hand quantities by location and product."
      />

      {!hasNoRecords ? (
        <ListPageDataSectionsStack>
          <InventoryListToolbar
            showSearch={false}
            isLoading={isRefreshing}
            onRefresh={() => void reload()}
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

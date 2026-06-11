"use client";

import { ArrowLeftRight } from "lucide-react";
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
import { MovementsTable } from "@/features/inventory/components/tables/movements-table";
import { useInventoryList } from "@/features/inventory/hooks/use-inventory-list";
import { fetchInventoryMovements } from "@/features/inventory/services/inventory.service";
import type {
  InventoryListFilters,
  InventoryMovement,
} from "@/features/inventory/types/inventory.types";

export function MovementsListPage() {
  const router = useRouter();
  const fetchFn = useCallback(
    (f: InventoryListFilters) => fetchInventoryMovements(f),
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
  } = useInventoryList<InventoryMovement>({ fetchFn });

  const handleRowClick = useCallback(
    (item: InventoryMovement) => router.push(ROUTES.inventoryMovementDetail(item.uuid)),
    [router],
  );

  if (isUnauthorized) {
    return <InventoryListAccessDenied />;
  }

  return (
    <ListPageLayout data-testid="inventory-movements-page">
      <InventoryListPageHeader
        title="Movements"
        description="Inventory movement history across locations."
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
        loadingMessage="Loading movements..."
        error={error}
        onRetry={() => void reload()}
        errorTitle="Could not load movements"
        hasNoRecords={hasNoRecords}
        emptyState={
          <InventoryListEmptyState
            icon={ArrowLeftRight}
            title="No movements yet"
            description="Stock movements will appear here as inventory is transferred."
          />
        }
        isFilteredEmpty={isFilteredEmpty}
      >
        <MovementsTable items={items} onRowClick={handleRowClick} />
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

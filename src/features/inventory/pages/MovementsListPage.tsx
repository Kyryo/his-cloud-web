"use client";

import { ArrowLeftRight } from "lucide-react";
import { useCallback, useState } from "react";

import {
  ListPageDataSectionsStack,
  ListPageLayout,
} from "@/features/app-shell/components/page-layout";
import { InventoryFiltersSheet } from "@/features/inventory/components/InventoryFiltersSheet";
import { InventoryListToolbar } from "@/features/inventory/components/InventoryListToolbar";
import { MovementDetailDialog } from "@/features/inventory/components/MovementDetailDialog";
import { InventoryListAccessDenied } from "@/features/inventory/components/list/InventoryListAccessDenied";
import { InventoryListEmptyState } from "@/features/inventory/components/list/InventoryListEmptyState";
import { InventoryListPageContent } from "@/features/inventory/components/list/InventoryListPageContent";
import { InventoryListPageHeader } from "@/features/inventory/components/list/InventoryListPageHeader";
import { InventoryListPagination } from "@/features/inventory/components/list/InventoryListTable";
import { MovementsTable } from "@/features/inventory/components/tables/movements-table";
import { useInventoryListFilters } from "@/features/inventory/hooks/use-inventory-list-filters";
import { fetchInventoryMovements } from "@/features/inventory/services/inventory.service";
import type {
  InventoryListFilters,
  InventoryMovement,
} from "@/features/inventory/types/inventory.types";
import {
  buildMovementListFilters,
  countActiveMovementFilters,
  DEFAULT_MOVEMENT_SHEET_FILTERS,
} from "@/features/inventory/utils/inventory-list-filters";

export function MovementsListPage() {
  const [selectedMovement, setSelectedMovement] = useState<InventoryMovement | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchFn = useCallback(
    (f: InventoryListFilters) => fetchInventoryMovements(f),
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
    defaultSheetFilters: DEFAULT_MOVEMENT_SHEET_FILTERS,
    buildExtraFilters: buildMovementListFilters,
    countActiveSheetFilters: countActiveMovementFilters,
  });

  const handleRowClick = useCallback((item: InventoryMovement) => {
    setSelectedMovement(item);
    setDetailOpen(true);
  }, []);

  const handleDetailOpenChange = useCallback((open: boolean) => {
    setDetailOpen(open);
  }, []);

  if (isUnauthorized) {
    return <InventoryListAccessDenied />;
  }

  return (
    <ListPageLayout data-testid="inventory-movements-page">
      <MovementDetailDialog
        movement={selectedMovement}
        open={detailOpen}
        onOpenChange={handleDetailOpenChange}
      />

      <InventoryListPageHeader
        title="Movements"
        description="Inventory movement history across locations."
        search={search}
        isSearchDisabled={isRefreshing}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        searchPlaceholder="Search by reference or notes..."
      />

      {!hasNoRecords ? (
        <ListPageDataSectionsStack>
          <InventoryListToolbar
            search={search}
            searchPlaceholder="Search by reference or notes..."
            isLoading={isRefreshing}
            onSearchChange={setSearch}
            onSearchSubmit={handleSearchSubmit}
            onClearSearch={handleClearSearch}
            onRefresh={() => void reload()}
            filters={
              <InventoryFiltersSheet
                variant="movements"
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
        filteredEmptyTitle="No matching movements"
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

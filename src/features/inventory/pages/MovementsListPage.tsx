"use client";

import { ArrowLeftRight } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  ListPageLayout,
  ListPagePagination,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";
import { InventoryListPageHeaderBar } from "@/features/inventory/components/InventoryListPageHeaderBar";
import { MovementDetailDialog } from "@/features/inventory/components/MovementDetailDialog";
import { InventoryListAccessDenied } from "@/features/inventory/components/list/InventoryListAccessDenied";
import { InventoryListEmptyState } from "@/features/inventory/components/list/InventoryListEmptyState";
import { InventoryListFilteredEmpty } from "@/features/inventory/components/list/InventoryListFilteredEmpty";
import { InventoryTableSkeleton } from "@/features/inventory/components/tables/InventoryTableSkeleton";
import {
  MOVEMENTS_TABLE_SKELETON_COLUMNS,
  MovementsTable,
} from "@/features/inventory/components/tables/movements-table";
import { useInventoryListFilters } from "@/features/inventory/hooks/use-inventory-list-filters";
import { fetchInventoryMovements } from "@/features/inventory/services/inventory.service";
import type {
  InventoryListFilters,
  InventoryMovement,
} from "@/features/inventory/types/inventory.types";
import type { InventoryListSearchFilters } from "@/features/inventory/utils/inventory-list-filter-chips";
import {
  buildMovementListFilters,
  countActiveMovementFilters,
  DEFAULT_MOVEMENT_SHEET_FILTERS,
  type MovementSheetFilters,
} from "@/features/inventory/utils/inventory-list-filters";

export function MovementsListPage() {
  const [selectedMovement, setSelectedMovement] =
    useState<InventoryMovement | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchFn = useCallback(
    (filters: InventoryListFilters) => fetchInventoryMovements(filters),
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

  const applyFilters = useCallback(
    (nextFilters: InventoryListSearchFilters) => {
      handleFiltersApply(nextFilters as MovementSheetFilters);
    },
    [handleFiltersApply],
  );

  const handleClearSearchAndFilters = useCallback(() => {
    handleClearSearch();
    handleFiltersApply(DEFAULT_MOVEMENT_SHEET_FILTERS);
  }, [handleClearSearch, handleFiltersApply]);

  const handleRowClick = useCallback((item: InventoryMovement) => {
    setSelectedMovement(item);
    setDetailOpen(true);
  }, []);

  if (isUnauthorized) {
    return <InventoryListAccessDenied />;
  }

  return (
    <ListPageLayout data-testid="inventory-movements-page">
      <MovementDetailDialog
        movement={selectedMovement}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <InventoryListPageHeaderBar
        variant="movements"
        search={search}
        filters={sheetFilters}
        isLoading={isRefreshing}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        onFiltersApply={applyFilters}
      />

      <ListPageTableSection>
        {isLoading ? (
          <InventoryTableSkeleton columns={MOVEMENTS_TABLE_SKELETON_COLUMNS} />
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-sm font-semibold text-red-800">
              Could not load movements
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
            icon={ArrowLeftRight}
            title="No movements yet"
            description="Stock movements will appear here as inventory is transferred."
          />
        ) : isFilteredEmpty ? (
          <InventoryListFilteredEmpty
            title="No matching movements"
            onClear={handleClearSearchAndFilters}
          />
        ) : (
          <>
            <MovementsTable items={items} onRowClick={handleRowClick} />
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

"use client";

import { Layers } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { FabButton } from "@/components/ui/fab-button";
import {
  ListPageLayout,
  ListPagePagination,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";
import { BatchDetailDialog } from "@/features/inventory/components/BatchDetailDialog";
import { CreateBatchDialog } from "@/features/inventory/components/CreateBatchDialog";
import {
  InventoryListPageHeaderBar,
  InventoryListPrimaryAction,
} from "@/features/inventory/components/InventoryListPageHeaderBar";
import { InventoryListAccessDenied } from "@/features/inventory/components/list/InventoryListAccessDenied";
import { InventoryListEmptyState } from "@/features/inventory/components/list/InventoryListEmptyState";
import { InventoryListFilteredEmpty } from "@/features/inventory/components/list/InventoryListFilteredEmpty";
import { InventoryTableSkeleton } from "@/features/inventory/components/tables/InventoryTableSkeleton";
import {
  BATCHES_TABLE_SKELETON_COLUMNS,
  BatchesTable,
} from "@/features/inventory/components/tables/batches-table";
import { useInventoryListFilters } from "@/features/inventory/hooks/use-inventory-list-filters";
import { fetchInventoryBatches } from "@/features/inventory/services/batches.service";
import type {
  InventoryBatch,
  InventoryListFilters,
} from "@/features/inventory/types/inventory.types";
import type { InventoryListSearchFilters } from "@/features/inventory/utils/inventory-list-filter-chips";
import {
  buildBatchListFilters,
  countActiveBatchFilters,
  DEFAULT_BATCH_SHEET_FILTERS,
  type BatchSheetFilters,
} from "@/features/inventory/utils/inventory-list-filters";

export function BatchesListPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<InventoryBatch | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchFn = useCallback(
    (filters: InventoryListFilters) => fetchInventoryBatches(filters),
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
    defaultSheetFilters: DEFAULT_BATCH_SHEET_FILTERS,
    buildExtraFilters: buildBatchListFilters,
    countActiveSheetFilters: countActiveBatchFilters,
  });

  const applyFilters = useCallback(
    (nextFilters: InventoryListSearchFilters) => {
      handleFiltersApply(nextFilters as BatchSheetFilters);
    },
    [handleFiltersApply],
  );

  const handleClearSearchAndFilters = useCallback(() => {
    handleClearSearch();
    handleFiltersApply(DEFAULT_BATCH_SHEET_FILTERS);
  }, [handleClearSearch, handleFiltersApply]);

  const handleAdd = useCallback(() => {
    setCreateOpen(true);
  }, []);

  const handleRowClick = useCallback((item: InventoryBatch) => {
    setSelectedBatch(item);
    setDetailOpen(true);
  }, []);

  if (isUnauthorized) {
    return <InventoryListAccessDenied />;
  }

  return (
    <ListPageLayout data-testid="inventory-batches-page">
      <CreateBatchDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => void reload()}
      />
      <BatchDetailDialog
        batch={selectedBatch}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <InventoryListPageHeaderBar
        variant="batches"
        search={search}
        filters={sheetFilters}
        isLoading={isRefreshing}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        onFiltersApply={applyFilters}
        trailing={
          <InventoryListPrimaryAction
            label="New Batch"
            onClick={handleAdd}
            data-testid="add-batch-button"
          />
        }
      />

      <FabButton
        label="New batch"
        onClick={handleAdd}
        data-testid="add-batch-fab"
      />

      <ListPageTableSection>
        {isLoading ? (
          <InventoryTableSkeleton columns={BATCHES_TABLE_SKELETON_COLUMNS} />
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-sm font-semibold text-red-800">Could not load batches</h2>
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
            icon={Layers}
            title="No batches yet"
            description="Create batch records to track expiry and lot numbers."
            actionLabel="New batch"
            onAction={handleAdd}
          />
        ) : isFilteredEmpty ? (
          <InventoryListFilteredEmpty
            title="No matching batches"
            onClear={handleClearSearchAndFilters}
          />
        ) : (
          <>
            <BatchesTable items={items} onRowClick={handleRowClick} />
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

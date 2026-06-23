"use client";

import { Layers } from "lucide-react";
import { useCallback, useState } from "react";

import { AddActionButton } from "@/components/ui/app-buttons";
import { FabButton } from "@/components/ui/fab-button";
import {
  ListPageDataSectionsStack,
  ListPageLayout,
} from "@/features/app-shell/components/page-layout";
import { BatchDetailDialog } from "@/features/inventory/components/BatchDetailDialog";
import { CreateBatchDialog } from "@/features/inventory/components/CreateBatchDialog";
import { InventoryFiltersSheet } from "@/features/inventory/components/InventoryFiltersSheet";
import { InventoryListToolbar } from "@/features/inventory/components/InventoryListToolbar";
import { InventoryListAccessDenied } from "@/features/inventory/components/list/InventoryListAccessDenied";
import { InventoryListEmptyState } from "@/features/inventory/components/list/InventoryListEmptyState";
import { InventoryListPageContent } from "@/features/inventory/components/list/InventoryListPageContent";
import { InventoryListPageHeader } from "@/features/inventory/components/list/InventoryListPageHeader";
import { InventoryListPagination } from "@/features/inventory/components/list/InventoryListTable";
import { BatchesTable } from "@/features/inventory/components/tables/batches-table";
import { useInventoryListFilters } from "@/features/inventory/hooks/use-inventory-list-filters";
import { fetchInventoryBatches } from "@/features/inventory/services/batches.service";
import type {
  InventoryBatch,
  InventoryListFilters,
} from "@/features/inventory/types/inventory.types";
import {
  buildBatchListFilters,
  countActiveBatchFilters,
  DEFAULT_BATCH_SHEET_FILTERS,
} from "@/features/inventory/utils/inventory-list-filters";

export function BatchesListPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<InventoryBatch | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchFn = useCallback(
    (f: InventoryListFilters) => fetchInventoryBatches(f),
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

  const handleAdd = useCallback(() => {
    setCreateOpen(true);
  }, []);

  const handleRowClick = useCallback((item: InventoryBatch) => {
    setSelectedBatch(item);
    setDetailOpen(true);
  }, []);

  const handleDetailOpenChange = useCallback((open: boolean) => {
    setDetailOpen(open);
  }, []);

  const handleBatchCreated = useCallback(() => {
    void reload();
  }, [reload]);

  if (isUnauthorized) {
    return <InventoryListAccessDenied />;
  }

  return (
    <ListPageLayout data-testid="inventory-batches-page">
      <CreateBatchDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleBatchCreated}
      />
      <BatchDetailDialog
        batch={selectedBatch}
        open={detailOpen}
        onOpenChange={handleDetailOpenChange}
      />

      <InventoryListPageHeader
        title="Batches"
        description="Track batch numbers, expiry, and supplier details."
        addLabel="New batch"
        onAdd={handleAdd}
        search={search}
        isSearchDisabled={isRefreshing}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        searchPlaceholder="Search by batch number, supplier, or notes..."
        data-testid="add-batch-button"
      />

      <FabButton
        label="New batch"
        onClick={handleAdd}
        data-testid="add-batch-fab"
      />

      {!hasNoRecords ? (
        <ListPageDataSectionsStack>
          <InventoryListToolbar
            search={search}
            searchPlaceholder="Search by batch number, supplier, or notes..."
            isLoading={isRefreshing}
            onSearchChange={setSearch}
            onSearchSubmit={handleSearchSubmit}
            onClearSearch={handleClearSearch}
            onRefresh={() => void reload()}
            filters={
              <InventoryFiltersSheet
                variant="batches"
                filters={sheetFilters}
                isLoading={isRefreshing}
                onApply={(filters) => handleFiltersApply(filters as typeof sheetFilters)}
              />
            }
            primaryAction={
              <AddActionButton
                label="New batch"
                className="hidden sm:inline-flex"
                onClick={handleAdd}
              />
            }
          />
        </ListPageDataSectionsStack>
      ) : null}

      <InventoryListPageContent
        isLoading={isLoading}
        loadingMessage="Loading batches..."
        error={error}
        onRetry={() => void reload()}
        errorTitle="Could not load batches"
        hasNoRecords={hasNoRecords}
        emptyState={
          <InventoryListEmptyState
            icon={Layers}
            title="No batches yet"
            description="Create batch records to track expiry and lot numbers."
            actionLabel="New batch"
            onAction={handleAdd}
          />
        }
        isFilteredEmpty={isFilteredEmpty}
        filteredEmptyTitle="No matching batches"
      >
        <BatchesTable items={items} onRowClick={handleRowClick} />
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

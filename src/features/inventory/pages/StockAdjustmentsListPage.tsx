"use client";

import { ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { AddActionButton } from "@/components/ui/app-buttons";
import { FabButton } from "@/components/ui/fab-button";
import { ROUTES } from "@/constants/routes";
import {
  ListPageDataSectionsStack,
  ListPageLayout,
} from "@/features/app-shell/components/page-layout";
import { CreateStockAdjustmentDialog } from "@/features/inventory/components/CreateStockAdjustmentDialog";
import { InventoryListToolbar } from "@/features/inventory/components/InventoryListToolbar";
import { InventoryListAccessDenied } from "@/features/inventory/components/list/InventoryListAccessDenied";
import { InventoryListEmptyState } from "@/features/inventory/components/list/InventoryListEmptyState";
import { InventoryListPageContent } from "@/features/inventory/components/list/InventoryListPageContent";
import { InventoryListPageHeader } from "@/features/inventory/components/list/InventoryListPageHeader";
import { InventoryListPagination } from "@/features/inventory/components/list/InventoryListTable";
import { StockAdjustmentsTable } from "@/features/inventory/components/tables/stock-adjustments-table";
import { useInventoryList } from "@/features/inventory/hooks/use-inventory-list";
import { fetchStockAdjustments } from "@/features/inventory/services/stock-adjustments.service";
import type {
  InventoryListFilters,
  StockAdjustment,
} from "@/features/inventory/types/inventory.types";

export function StockAdjustmentsListPage() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const fetchFn = useCallback(
    (f: InventoryListFilters) => fetchStockAdjustments(f),
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
  } = useInventoryList<StockAdjustment>({ fetchFn });

  const handleCreate = useCallback(() => {
    setCreateOpen(true);
  }, []);

  const handleRowClick = useCallback(
    (adjustment: StockAdjustment) =>
      router.push(ROUTES.inventoryStockAdjustmentDetail(adjustment.uuid)),
    [router],
  );

  if (isUnauthorized) {
    return <InventoryListAccessDenied />;
  }

  return (
    <ListPageLayout data-testid="inventory-stock-adjustments-page">
      <CreateStockAdjustmentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(adjustment) =>
          router.push(ROUTES.inventoryStockAdjustmentDetail(adjustment.uuid))
        }
      />

      <InventoryListPageHeader
        title="Stock adjustments"
        description="Correct on-hand quantities and costs."
        addLabel="New adjustment"
        onAdd={handleCreate}
        data-testid="add-stock-adjustment-button"
      />

      <FabButton
        label="New adjustment"
        onClick={handleCreate}
        data-testid="add-stock-adjustment-fab"
      />

      {!hasNoRecords ? (
        <ListPageDataSectionsStack>
          <InventoryListToolbar
            showSearch={false}
            isLoading={isRefreshing}
            onRefresh={() => void reload()}
            primaryAction={
              <AddActionButton
                label="New adjustment"
                className="hidden sm:inline-flex"
                onClick={handleCreate}
              />
            }
          />
        </ListPageDataSectionsStack>
      ) : null}

      <InventoryListPageContent
        isLoading={isLoading}
        loadingMessage="Loading stock adjustments..."
        error={error}
        onRetry={() => void reload()}
        errorTitle="Could not load stock adjustments"
        hasNoRecords={hasNoRecords}
        emptyState={
          <InventoryListEmptyState
            icon={ClipboardList}
            title="No stock adjustments yet"
            description="Create an adjustment to correct inventory quantities or costs."
            actionLabel="New adjustment"
            onAction={handleCreate}
          />
        }
        isFilteredEmpty={isFilteredEmpty}
      >
        <StockAdjustmentsTable adjustments={items} onRowClick={handleRowClick} />
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

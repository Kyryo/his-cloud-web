"use client";

import { Receipt } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { FabButton } from "@/components/ui/fab-button";
import { ROUTES } from "@/constants/routes";
import {
  ListPageLayout,
  ListPagePagination,
  ListPageTableSection,
} from "@/features/app-shell/components/page-layout";
import { fetchCatalogPricelists } from "@/features/catalog/services/catalog.service";
import type { CatalogPricelist } from "@/features/catalog/types/catalog.types";
import { InventoryListAccessDenied } from "@/features/inventory/components/list/InventoryListAccessDenied";
import { InventoryListEmptyState } from "@/features/inventory/components/list/InventoryListEmptyState";
import { PricelistsPageHeader } from "@/features/inventory/components/PricelistsPageHeader";
import { PricelistsTable } from "@/features/inventory/components/tables/pricelists-table";
import { PricelistsTableSkeleton } from "@/features/inventory/components/tables/PricelistsTableSkeleton";
import { useInventoryListFilters } from "@/features/inventory/hooks/use-inventory-list-filters";
import type { InventoryListFilters } from "@/features/inventory/types/inventory.types";
import { AddPricelistDialog } from "@/features/settings/components/AddPricelistDialog";
import type { OrganizationPricelist } from "@/features/settings/types/settings.types";
import type { PaginatedListResponse } from "@/types/api.types";

const DEFAULT_SHEET_FILTERS = { include_inactive: false } as const;

function buildPricelistListFilters() {
  return {};
}

function countPricelistSheetFilters() {
  return 0;
}

async function fetchPricelists(
  filters: InventoryListFilters,
): Promise<PaginatedListResponse<CatalogPricelist>> {
  return fetchCatalogPricelists({
    page: filters.page,
    pageSize: filters.pageSize,
    search: filters.search,
    include_inactive: DEFAULT_SHEET_FILTERS.include_inactive,
  });
}

export function PricelistsListPage() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const fetchFn = useCallback(
    (filters: InventoryListFilters) => fetchPricelists(filters),
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
  } = useInventoryListFilters({
    fetchFn,
    defaultSheetFilters: DEFAULT_SHEET_FILTERS,
    buildExtraFilters: buildPricelistListFilters,
    countActiveSheetFilters: countPricelistSheetFilters,
  });

  const handleCreate = useCallback(() => {
    setCreateOpen(true);
  }, []);

  const handlePricelistCreated = useCallback(
    (pricelist: OrganizationPricelist) => {
      void reload();
      router.push(ROUTES.inventoryPricelistDetail(pricelist.uuid));
    },
    [reload, router],
  );

  const handleRowClick = useCallback(
    (pricelist: CatalogPricelist) =>
      router.push(ROUTES.inventoryPricelistDetail(pricelist.uuid)),
    [router],
  );

  if (isUnauthorized) {
    return <InventoryListAccessDenied />;
  }

  return (
    <ListPageLayout data-testid="inventory-pricelists-page">
      <AddPricelistDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handlePricelistCreated}
      />

      <PricelistsPageHeader
        search={search}
        isLoading={isRefreshing}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        onNewPricelist={handleCreate}
      />

      <FabButton
        label="New pricelist"
        onClick={handleCreate}
        data-testid="add-pricelist-fab"
      />

      <ListPageTableSection>
        {isLoading ? (
          <PricelistsTableSkeleton rows={8} />
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-sm font-semibold text-red-800">
              Could not load pricelists
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
            icon={Receipt}
            title="No pricelists found"
            description="Create a pricelist to start assigning product prices."
            actionLabel="New pricelist"
            onAction={handleCreate}
          />
        ) : isFilteredEmpty ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-dash-border py-14 text-center">
            <h2 className="text-base font-semibold text-brand-navy">
              No matching pricelists
            </h2>
            <p className="mt-1 text-sm text-brand-muted">
              Adjust your search and try again.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={handleClearSearch}
            >
              Clear search
            </Button>
          </div>
        ) : (
          <>
            <PricelistsTable pricelists={items} onRowClick={handleRowClick} />
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

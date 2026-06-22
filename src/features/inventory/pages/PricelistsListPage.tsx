"use client";

import { Receipt } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { FabButton } from "@/components/ui/fab-button";
import { ROUTES } from "@/constants/routes";
import {
  ListPageDataSectionsStack,
  ListPageLayout,
} from "@/features/app-shell/components/page-layout";
import { fetchCatalogPricelists } from "@/features/catalog/services/catalog.service";
import type { CatalogPricelist } from "@/features/catalog/types/catalog.types";
import { AddPricelistDialog } from "@/features/settings/components/AddPricelistDialog";
import { InventoryListAccessDenied } from "@/features/inventory/components/list/InventoryListAccessDenied";
import { InventoryListEmptyState } from "@/features/inventory/components/list/InventoryListEmptyState";
import { InventoryListPageContent } from "@/features/inventory/components/list/InventoryListPageContent";
import { InventoryListPageHeader } from "@/features/inventory/components/list/InventoryListPageHeader";
import { InventoryListPagination } from "@/features/inventory/components/list/InventoryListTable";
import { InventoryListToolbar } from "@/features/inventory/components/InventoryListToolbar";
import { PricelistsTable } from "@/features/inventory/components/tables/pricelists-table";
import { useInventoryListFilters } from "@/features/inventory/hooks/use-inventory-list-filters";
import type { InventoryListFilters } from "@/features/inventory/types/inventory.types";
import type { OrganizationPricelist } from "@/features/settings/types/settings.types";
import type { PaginatedListResponse } from "@/types/api.types";

const DEFAULT_SHEET_FILTERS = { include_inactive: false } as const;

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
    buildExtraFilters: () => ({}),
    countActiveSheetFilters: () => 0,
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

      <InventoryListPageHeader
        title="Pricelists"
        description="Manage catalog pricelists and product pricing rules."
        addLabel="New pricelist"
        onAdd={handleCreate}
        search={search}
        isSearchDisabled={isRefreshing}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        searchPlaceholder="Search by name..."
        data-testid="add-pricelist-button"
      />

      <FabButton
        label="New pricelist"
        onClick={handleCreate}
        data-testid="add-pricelist-fab"
      />

      {!hasNoRecords ? (
        <ListPageDataSectionsStack>
          <InventoryListToolbar
            search={search}
            searchPlaceholder="Search by name..."
            isLoading={isRefreshing}
            onSearchChange={setSearch}
            onSearchSubmit={handleSearchSubmit}
            onClearSearch={handleClearSearch}
          />
        </ListPageDataSectionsStack>
      ) : null}

      <InventoryListPageContent
        isLoading={isLoading}
        loadingMessage="Loading pricelists..."
        error={error}
        onRetry={() => void reload()}
        errorTitle="Could not load pricelists"
        hasNoRecords={hasNoRecords}
        emptyState={
          <InventoryListEmptyState
            icon={Receipt}
            title="No pricelists found"
            description="Create a pricelist to start assigning product prices."
            actionLabel="New pricelist"
            onAction={handleCreate}
          />
        }
        isFilteredEmpty={isFilteredEmpty}
        filteredEmptyTitle="No matching pricelists"
      >
        <PricelistsTable pricelists={items} onRowClick={handleRowClick} />
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

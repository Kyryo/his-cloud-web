"use client";

import { Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { AddActionButton } from "@/components/ui/app-buttons";
import { FabButton } from "@/components/ui/fab-button";
import { ROUTES } from "@/constants/routes";
import {
  ListPageDataSectionsStack,
  ListPageLayout,
} from "@/features/app-shell/components/page-layout";
import { CreateProductDialog } from "@/features/inventory/components/CreateProductDialog";
import { InventoryFiltersSheet } from "@/features/inventory/components/InventoryFiltersSheet";
import { InventoryListToolbar } from "@/features/inventory/components/InventoryListToolbar";
import { InventoryListAccessDenied } from "@/features/inventory/components/list/InventoryListAccessDenied";
import { InventoryListEmptyState } from "@/features/inventory/components/list/InventoryListEmptyState";
import { InventoryListPageContent } from "@/features/inventory/components/list/InventoryListPageContent";
import { InventoryListPageHeader } from "@/features/inventory/components/list/InventoryListPageHeader";
import { InventoryListPagination } from "@/features/inventory/components/list/InventoryListTable";
import { ProductsTable } from "@/features/inventory/components/tables/products-table";
import { useInventoryListFilters } from "@/features/inventory/hooks/use-inventory-list-filters";
import { searchInventoryProducts } from "@/features/inventory/services/inventory.service";
import type {
  InventoryListFilters,
  InventoryProduct,
} from "@/features/inventory/types/inventory.types";
import {
  buildProductListFilters,
  countActiveProductFilters,
  DEFAULT_PRODUCT_SHEET_FILTERS,
} from "@/features/inventory/utils/inventory-list-filters";
import type { PaginatedListResponse } from "@/types/api.types";

async function fetchProducts(
  filters: InventoryListFilters,
): Promise<PaginatedListResponse<InventoryProduct>> {
  const results = await searchInventoryProducts({
    q: filters.search,
    active: filters.is_active,
  });
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const start = (page - 1) * pageSize;

  return {
    results: results.slice(start, start + pageSize),
    pagination: { count: results.length, next: null, previous: null },
  };
}

export function ProductsListPage() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const fetchFn = useCallback(
    (f: InventoryListFilters) => fetchProducts(f),
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
    defaultSheetFilters: DEFAULT_PRODUCT_SHEET_FILTERS,
    buildExtraFilters: buildProductListFilters,
    countActiveSheetFilters: countActiveProductFilters,
  });

  const handleCreate = useCallback(() => {
    setCreateOpen(true);
  }, []);

  const handleProductCreated = useCallback(
    (product: InventoryProduct) => {
      void reload();
      router.push(ROUTES.inventoryProductDetail(product.id));
    },
    [reload, router],
  );

  const handleRowClick = useCallback(
    (product: InventoryProduct) => router.push(ROUTES.inventoryProductDetail(product.id)),
    [router],
  );

  if (isUnauthorized) {
    return <InventoryListAccessDenied />;
  }

  return (
    <ListPageLayout data-testid="inventory-products-page">
      <CreateProductDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleProductCreated}
      />

      <InventoryListPageHeader
        title="Products"
        description="Search products synced from ERP."
        addLabel="New product"
        onAdd={handleCreate}
        search={search}
        isSearchDisabled={isRefreshing}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        searchPlaceholder="Search by name, code, or barcode..."
        data-testid="add-product-button"
      />

      <FabButton
        label="New product"
        onClick={handleCreate}
        data-testid="add-product-fab"
      />

      {!hasNoRecords ? (
        <ListPageDataSectionsStack>
          <InventoryListToolbar
            search={search}
            searchPlaceholder="Search by name, code, or barcode..."
            isLoading={isRefreshing}
            onSearchChange={setSearch}
            onSearchSubmit={handleSearchSubmit}
            onClearSearch={handleClearSearch}
            filters={
              <InventoryFiltersSheet
                variant="products"
                filters={sheetFilters}
                isLoading={isRefreshing}
                onApply={handleFiltersApply}
              />
            }
          />
        </ListPageDataSectionsStack>
      ) : null}

      <InventoryListPageContent
        isLoading={isLoading}
        loadingMessage="Loading products..."
        error={error}
        onRetry={() => void reload()}
        errorTitle="Could not load products"
        hasNoRecords={hasNoRecords}
        emptyState={
          <InventoryListEmptyState
            icon={Package}
            title="No products found"
            description="Create a product or sync from ERP to get started."
            actionLabel="New product"
            onAction={handleCreate}
          />
        }
        isFilteredEmpty={isFilteredEmpty}
        filteredEmptyTitle="No matching products"
      >
        <ProductsTable products={items} onRowClick={handleRowClick} />
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

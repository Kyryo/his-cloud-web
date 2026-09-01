"use client";

import { Package } from "lucide-react";
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
import { fetchCatalogProducts } from "@/features/catalog/services/catalog.service";
import { CreateProductDialog } from "@/features/inventory/components/CreateProductDialog";
import { InventoryListAccessDenied } from "@/features/inventory/components/list/InventoryListAccessDenied";
import { InventoryListEmptyState } from "@/features/inventory/components/list/InventoryListEmptyState";
import { ProductsPageHeader } from "@/features/inventory/components/ProductsPageHeader";
import { ProductsTable } from "@/features/inventory/components/tables/products-table";
import { ProductsTableSkeleton } from "@/features/inventory/components/tables/ProductsTableSkeleton";
import { useInventoryListFilters } from "@/features/inventory/hooks/use-inventory-list-filters";
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
  return fetchCatalogProducts({
    page: filters.page,
    pageSize: filters.pageSize,
    search: filters.search,
    active: filters.is_active,
  });
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

  const handleClearSearchAndFilters = useCallback(() => {
    handleClearSearch();
    handleFiltersApply(DEFAULT_PRODUCT_SHEET_FILTERS);
  }, [handleClearSearch, handleFiltersApply]);

  const handleCreate = useCallback(() => {
    setCreateOpen(true);
  }, []);

  const handleProductCreated = useCallback(
    (product: InventoryProduct) => {
      void reload();
      router.push(ROUTES.inventoryProductDetail(product.uuid));
    },
    [reload, router],
  );

  const handleRowClick = useCallback(
    (product: InventoryProduct) =>
      router.push(ROUTES.inventoryProductDetail(product.uuid)),
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

      <ProductsPageHeader
        search={search}
        filters={sheetFilters}
        isLoading={isRefreshing}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        onFiltersApply={handleFiltersApply}
        onNewProduct={handleCreate}
      />

      <FabButton
        label="New product"
        onClick={handleCreate}
        data-testid="add-product-fab"
      />

      <ListPageTableSection>
        {isLoading ? (
          <ProductsTableSkeleton rows={8} />
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-sm font-semibold text-red-800">Could not load products</h2>
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
            icon={Package}
            title="No products found"
            description="Create a product or import from CSV to get started."
            actionLabel="New product"
            onAction={handleCreate}
          />
        ) : isFilteredEmpty ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-dash-border py-14 text-center">
            <h2 className="text-base font-semibold text-brand-navy">No matching products</h2>
            <p className="mt-1 text-sm text-brand-muted">
              Adjust your search or filters and try again.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={handleClearSearchAndFilters}
            >
              Clear search & filters
            </Button>
          </div>
        ) : (
          <>
            <ProductsTable products={items} onRowClick={handleRowClick} />
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

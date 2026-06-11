"use client";

import { Package } from "lucide-react";
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
import { ProductsTable } from "@/features/inventory/components/tables/products-table";
import { useInventoryList } from "@/features/inventory/hooks/use-inventory-list";
import { searchInventoryProducts } from "@/features/inventory/services/inventory.service";
import type {
  InventoryListFilters,
  InventoryProduct,
} from "@/features/inventory/types/inventory.types";
import type { PaginatedListResponse } from "@/types/api.types";

async function fetchProducts(
  filters: InventoryListFilters,
): Promise<PaginatedListResponse<InventoryProduct>> {
  const results = await searchInventoryProducts({
    q: filters.search,
    active: true,
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
  } = useInventoryList<InventoryProduct>({ fetchFn });

  const handleRowClick = useCallback(
    (product: InventoryProduct) => router.push(ROUTES.inventoryProductDetail(product.id)),
    [router],
  );

  if (isUnauthorized) {
    return <InventoryListAccessDenied />;
  }

  return (
    <ListPageLayout data-testid="inventory-products-page">
      <InventoryListPageHeader
        title="Products"
        description="Search products synced from ERP."
        search={search}
        isSearchDisabled={isRefreshing}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        searchPlaceholder="Search by name, code, or barcode..."
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
            onRefresh={() => void reload()}
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
            description="Products from ERP will appear here once synced."
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

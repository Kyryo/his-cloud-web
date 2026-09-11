"use client";

import type { ReactNode } from "react";

import {
  ListPageActiveFilters,
  ListPageFilterChip,
  ListPageSearchToolbar,
} from "@/features/app-shell/components/page-layout";
import { InventoryFiltersSheet } from "@/features/inventory/components/InventoryFiltersSheet";
import {
  ACTIVE_STATUS_OPTIONS,
  countActiveProductFilters,
  DEFAULT_INVENTORY_ORDERING,
  DEFAULT_PRODUCT_SHEET_FILTERS,
  INVENTORY_ORDERING_OPTIONS,
  type ProductSheetFilters,
} from "@/features/inventory/utils/inventory-list-filters";
import { cn } from "@/lib/utils";

type ProductsListToolbarProps = {
  search: string;
  filters: ProductSheetFilters;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: ProductSheetFilters) => void;
  trailing?: ReactNode;
  className?: string;
};

export function ProductsListToolbar({
  search,
  filters,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onFiltersApply,
  trailing,
  className,
}: ProductsListToolbarProps) {
  const hasStatusFilter = filters.activeStatus !== "active";
  const hasOrderingFilter = filters.ordering !== DEFAULT_INVENTORY_ORDERING;
  const hasAnyFilter = countActiveProductFilters(filters) > 0;
  const statusLabel =
    ACTIVE_STATUS_OPTIONS.find((opt) => opt.value === filters.activeStatus)
      ?.label ?? filters.activeStatus;
  const orderingLabel =
    INVENTORY_ORDERING_OPTIONS.find((opt) => opt.value === filters.ordering)
      ?.label ?? "Custom order";

  return (
    <div className={cn("space-y-2", className)}>
      <ListPageSearchToolbar
        search={search}
        searchId="inventory-products-search"
        placeholder="Search by name, code, barcode, or tariff code…"
        searchTestId="inventory-products-search"
        searchSubmitTestId="inventory-products-search-submit"
        clearTestId="inventory-products-search-clear"
        isLoading={isLoading}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={onClearSearch}
        filter={
          <InventoryFiltersSheet
            variant="products"
            filters={filters}
            isLoading={isLoading}
            onApply={(nextFilters) =>
              onFiltersApply(nextFilters as ProductSheetFilters)
            }
          />
        }
        trailing={trailing}
      />

      {hasAnyFilter ? (
        <ListPageActiveFilters
          disabled={isLoading}
          onClearAll={() => onFiltersApply(DEFAULT_PRODUCT_SHEET_FILTERS)}
        >
          {hasStatusFilter ? (
            <ListPageFilterChip
              label={`Status: ${statusLabel}`}
              disabled={isLoading}
              onRemove={() =>
                onFiltersApply({ ...filters, activeStatus: "active" })
              }
            />
          ) : null}
          {hasOrderingFilter ? (
            <ListPageFilterChip
              label={`Sort: ${orderingLabel}`}
              disabled={isLoading}
              onRemove={() =>
                onFiltersApply({
                  ...filters,
                  ordering: DEFAULT_INVENTORY_ORDERING,
                })
              }
            />
          ) : null}
        </ListPageActiveFilters>
      ) : null}
    </div>
  );
}

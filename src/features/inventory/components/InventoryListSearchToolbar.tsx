"use client";

import type { ReactNode } from "react";

import {
  ListPageActiveFilters,
  ListPageFilterChip,
  ListPageSearchToolbar,
} from "@/features/app-shell/components/page-layout";
import { InventoryFiltersSheet } from "@/features/inventory/components/InventoryFiltersSheet";
import {
  getDefaultFiltersForVariant,
  getInventoryFilterChips,
  type InventoryListSearchFilters,
  type InventoryListSearchVariant,
} from "@/features/inventory/utils/inventory-list-filter-chips";
import { cn } from "@/lib/utils";

const SEARCH_META: Record<
  InventoryListSearchVariant,
  {
    searchId: string;
    placeholder: string;
    searchTestId: string;
    searchSubmitTestId: string;
    clearTestId: string;
  }
> = {
  stock: {
    searchId: "inventory-stock-search",
    placeholder: "Search by product, location, or batch…",
    searchTestId: "inventory-stock-search",
    searchSubmitTestId: "inventory-stock-search-submit",
    clearTestId: "inventory-stock-search-clear",
  },
  "purchase-orders": {
    searchId: "inventory-purchase-orders-search",
    placeholder: "Search by reference, vendor, LPO, or GRN…",
    searchTestId: "inventory-purchase-orders-search",
    searchSubmitTestId: "inventory-purchase-orders-search-submit",
    clearTestId: "inventory-purchase-orders-search-clear",
  },
  "internal-orders": {
    searchId: "inventory-internal-orders-search",
    placeholder: "Search by reference or notes…",
    searchTestId: "inventory-internal-orders-search",
    searchSubmitTestId: "inventory-internal-orders-search-submit",
    clearTestId: "inventory-internal-orders-search-clear",
  },
  "stock-adjustments": {
    searchId: "inventory-stock-adjustments-search",
    placeholder: "Search by reference, reason, or notes…",
    searchTestId: "inventory-stock-adjustments-search",
    searchSubmitTestId: "inventory-stock-adjustments-search-submit",
    clearTestId: "inventory-stock-adjustments-search-clear",
  },
  movements: {
    searchId: "inventory-movements-search",
    placeholder: "Search by reference or notes…",
    searchTestId: "inventory-movements-search",
    searchSubmitTestId: "inventory-movements-search-submit",
    clearTestId: "inventory-movements-search-clear",
  },
  batches: {
    searchId: "inventory-batches-search",
    placeholder: "Search by batch number, supplier, or notes…",
    searchTestId: "inventory-batches-search",
    searchSubmitTestId: "inventory-batches-search-submit",
    clearTestId: "inventory-batches-search-clear",
  },
};

type InventoryListSearchToolbarProps = {
  variant: InventoryListSearchVariant;
  search: string;
  filters: InventoryListSearchFilters;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: InventoryListSearchFilters) => void;
  trailing?: ReactNode;
  className?: string;
};

export function InventoryListSearchToolbar({
  variant,
  search,
  filters,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onFiltersApply,
  trailing,
  className,
}: InventoryListSearchToolbarProps) {
  const meta = SEARCH_META[variant];
  const chips = getInventoryFilterChips(variant, filters, onFiltersApply);

  return (
    <div className={cn("space-y-2", className)}>
      <ListPageSearchToolbar
        search={search}
        searchId={meta.searchId}
        placeholder={meta.placeholder}
        searchTestId={meta.searchTestId}
        searchSubmitTestId={meta.searchSubmitTestId}
        clearTestId={meta.clearTestId}
        isLoading={isLoading}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={onClearSearch}
        filter={
          <InventoryFiltersSheet
            variant={variant}
            filters={filters}
            isLoading={isLoading}
            onApply={(nextFilters) =>
              onFiltersApply(nextFilters as InventoryListSearchFilters)
            }
          />
        }
        trailing={trailing}
      />

      {chips.length > 0 ? (
        <ListPageActiveFilters
          disabled={isLoading}
          onClearAll={() => onFiltersApply(getDefaultFiltersForVariant(variant))}
        >
          {chips.map((chip) => (
            <ListPageFilterChip
              key={chip.key}
              label={chip.label}
              disabled={isLoading}
              onRemove={chip.onClear}
            />
          ))}
        </ListPageActiveFilters>
      ) : null}
    </div>
  );
}

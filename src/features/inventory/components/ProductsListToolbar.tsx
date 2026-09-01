"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

import { ListPageSearchToolbar } from "@/features/app-shell/components/page-layout";
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
        placeholder="Search by name, code, barcode, or tariff code..."
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
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs">
          <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-dash-muted">
            Active filters:
          </span>

          {hasStatusFilter ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={() =>
                onFiltersApply({ ...filters, activeStatus: "active" })
              }
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-slate-200 bg-slate-100/90 px-2.5 py-0.5 text-slate-800 transition-colors hover:bg-slate-200"
            >
              <span>Status: {statusLabel}</span>
              <X className="size-3" />
            </button>
          ) : null}

          {hasOrderingFilter ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={() =>
                onFiltersApply({
                  ...filters,
                  ordering: DEFAULT_INVENTORY_ORDERING,
                })
              }
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-purple-200 bg-purple-50/80 px-2.5 py-0.5 text-purple-800 transition-colors hover:bg-purple-100"
            >
              <span>Sort: {orderingLabel}</span>
              <X className="size-3" />
            </button>
          ) : null}

          <button
            type="button"
            disabled={isLoading}
            onClick={() => onFiltersApply(DEFAULT_PRODUCT_SHEET_FILTERS)}
            className="ml-1 text-[11px] font-medium text-brand-primary underline transition-colors hover:text-brand-primary-hover"
          >
            Clear all
          </button>
        </div>
      ) : null}
    </div>
  );
}

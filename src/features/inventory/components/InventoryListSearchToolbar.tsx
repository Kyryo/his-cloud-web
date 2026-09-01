"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

import { ListPageSearchToolbar } from "@/features/app-shell/components/page-layout";
import { InventoryFiltersSheet } from "@/features/inventory/components/InventoryFiltersSheet";
import {
  getDefaultFiltersForVariant,
  getInventoryFilterChips,
  type InventoryFilterChipTone,
  type InventoryListSearchFilters,
  type InventoryListSearchVariant,
} from "@/features/inventory/utils/inventory-list-filter-chips";
import { cn } from "@/lib/utils";

const CHIP_TONE_CLASS: Record<InventoryFilterChipTone, string> = {
  slate:
    "border-slate-200 bg-slate-100/90 text-slate-800 hover:bg-slate-200",
  blue: "border-blue-200 bg-blue-50/80 text-blue-800 hover:bg-blue-100",
  purple: "border-purple-200 bg-purple-50/80 text-purple-800 hover:bg-purple-100",
  amber: "border-amber-200 bg-amber-50/80 text-amber-800 hover:bg-amber-100",
  emerald:
    "border-emerald-200 bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100",
};

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
    placeholder: "Search by product, location, or batch...",
    searchTestId: "inventory-stock-search",
    searchSubmitTestId: "inventory-stock-search-submit",
    clearTestId: "inventory-stock-search-clear",
  },
  "purchase-orders": {
    searchId: "inventory-purchase-orders-search",
    placeholder: "Search by reference, vendor, LPO, or GRN...",
    searchTestId: "inventory-purchase-orders-search",
    searchSubmitTestId: "inventory-purchase-orders-search-submit",
    clearTestId: "inventory-purchase-orders-search-clear",
  },
  "internal-orders": {
    searchId: "inventory-internal-orders-search",
    placeholder: "Search by reference or notes...",
    searchTestId: "inventory-internal-orders-search",
    searchSubmitTestId: "inventory-internal-orders-search-submit",
    clearTestId: "inventory-internal-orders-search-clear",
  },
  "stock-adjustments": {
    searchId: "inventory-stock-adjustments-search",
    placeholder: "Search by reference, reason, or notes...",
    searchTestId: "inventory-stock-adjustments-search",
    searchSubmitTestId: "inventory-stock-adjustments-search-submit",
    clearTestId: "inventory-stock-adjustments-search-clear",
  },
  movements: {
    searchId: "inventory-movements-search",
    placeholder: "Search by reference or notes...",
    searchTestId: "inventory-movements-search",
    searchSubmitTestId: "inventory-movements-search-submit",
    clearTestId: "inventory-movements-search-clear",
  },
  batches: {
    searchId: "inventory-batches-search",
    placeholder: "Search by batch number, supplier, or notes...",
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
            onApply={onFiltersApply}
          />
        }
        trailing={trailing}
      />

      {chips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs">
          <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-dash-muted">
            Active filters:
          </span>

          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              disabled={isLoading}
              onClick={chip.onClear}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-0.5 transition-colors",
                CHIP_TONE_CLASS[chip.tone],
              )}
            >
              <span>{chip.label}</span>
              <X className="size-3" />
            </button>
          ))}

          <button
            type="button"
            disabled={isLoading}
            onClick={() => onFiltersApply(getDefaultFiltersForVariant(variant))}
            className="ml-1 text-[11px] font-medium text-brand-primary underline transition-colors hover:text-brand-primary-hover"
          >
            Clear all
          </button>
        </div>
      ) : null}
    </div>
  );
}

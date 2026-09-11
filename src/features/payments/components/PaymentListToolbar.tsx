"use client";

import type { ReactNode } from "react";

import {
  ListPageActiveFilters,
  ListPageFilterChip,
  ListPageSearchToolbar,
} from "@/features/app-shell/components/page-layout";
import { PaymentFiltersSheet } from "@/features/payments/components/PaymentFiltersSheet";
import {
  countActivePaymentFilters,
  DEFAULT_PAYMENT_LIST_FILTERS,
  PAYMENT_STATE_OPTIONS,
  type PaymentListFilterState,
} from "@/features/payments/utils/payment-list-filters";
import { cn } from "@/lib/utils";

type PaymentListToolbarProps = {
  search: string;
  filters: PaymentListFilterState;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: PaymentListFilterState) => void;
  trailing?: ReactNode;
  className?: string;
};

export function PaymentListToolbar({
  search,
  filters,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onFiltersApply,
  trailing,
  className,
}: PaymentListToolbarProps) {
  const hasStateFilter = filters.state !== "all";
  const hasDateFilter = Boolean(filters.dateFrom || filters.dateTo);
  const hasAnyFilter = countActivePaymentFilters(filters) > 0;
  const stateLabel =
    PAYMENT_STATE_OPTIONS.find((opt) => opt.value === filters.state)?.label ??
    filters.state;

  return (
    <div className={cn("space-y-2", className)}>
      <ListPageSearchToolbar
        search={search}
        searchId="payment-search"
        placeholder="Search by payment reference, client, invoice, or method…"
        searchTestId="payments-search"
        searchSubmitTestId="payments-search-submit"
        clearTestId="payments-search-clear"
        isLoading={isLoading}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={onClearSearch}
        filter={
          <PaymentFiltersSheet
            filters={filters}
            isLoading={isLoading}
            onApply={onFiltersApply}
          />
        }
        trailing={trailing}
      />

      {hasAnyFilter ? (
        <ListPageActiveFilters
          disabled={isLoading}
          onClearAll={() => onFiltersApply(DEFAULT_PAYMENT_LIST_FILTERS)}
        >
          {hasStateFilter ? (
            <ListPageFilterChip
              label={`State: ${stateLabel}`}
              disabled={isLoading}
              onRemove={() => onFiltersApply({ ...filters, state: "all" })}
            />
          ) : null}
          {hasDateFilter ? (
            <ListPageFilterChip
              label="Date range filtered"
              disabled={isLoading}
              onRemove={() =>
                onFiltersApply({ ...filters, dateFrom: "", dateTo: "" })
              }
            />
          ) : null}
        </ListPageActiveFilters>
      ) : null}
    </div>
  );
}

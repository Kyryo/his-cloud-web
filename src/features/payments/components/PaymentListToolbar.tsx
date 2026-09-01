"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

import { ListPageSearchToolbar } from "@/features/app-shell/components/page-layout";
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
        placeholder="Search by payment reference, client, invoice, or method..."
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
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs">
          <span className="mr-1 text-[11px] font-semibold uppercase tracking-wider text-dash-muted">
            Active filters:
          </span>

          {hasStateFilter ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onFiltersApply({ ...filters, state: "all" })}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-blue-200 bg-blue-50/80 px-2.5 py-0.5 text-blue-800 transition-colors hover:bg-blue-100"
            >
              <span>State: {stateLabel}</span>
              <X className="size-3" />
            </button>
          ) : null}

          {hasDateFilter ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={() =>
                onFiltersApply({ ...filters, dateFrom: "", dateTo: "" })
              }
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-amber-200 bg-amber-50/80 px-2.5 py-0.5 text-amber-800 transition-colors hover:bg-amber-100"
            >
              <span>Date range filtered</span>
              <X className="size-3" />
            </button>
          ) : null}

          <button
            type="button"
            disabled={isLoading}
            onClick={() => onFiltersApply(DEFAULT_PAYMENT_LIST_FILTERS)}
            className="ml-1 text-[11px] font-medium text-brand-primary underline transition-colors hover:text-brand-primary-hover"
          >
            Clear all
          </button>
        </div>
      ) : null}
    </div>
  );
}

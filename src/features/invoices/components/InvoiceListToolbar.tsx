"use client";

import type { ReactNode } from "react";

import {
  ListPageActiveFilters,
  ListPageFilterChip,
  ListPageSearchToolbar,
} from "@/features/app-shell/components/page-layout";
import { InvoiceFiltersSheet } from "@/features/invoices/components/InvoiceFiltersSheet";
import {
  countActiveInvoiceFilters,
  DEFAULT_INVOICE_LIST_FILTERS,
  INVOICE_PAYMENT_STATUS_OPTIONS,
  INVOICE_STATE_OPTIONS,
  type InvoiceListFilterState,
} from "@/features/invoices/utils/invoice-list-filters";
import { cn } from "@/lib/utils";

type InvoiceListToolbarProps = {
  search: string;
  filters: InvoiceListFilterState;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: InvoiceListFilterState) => void;
  trailing?: ReactNode;
  className?: string;
};

export function InvoiceListToolbar({
  search,
  filters,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onFiltersApply,
  trailing,
  className,
}: InvoiceListToolbarProps) {
  const hasStateFilter = filters.state !== "all";
  const hasPaymentStatusFilter = filters.paymentStatus !== "all";
  const hasDateFilter = Boolean(filters.dateFrom || filters.dateTo);
  const hasAnyFilter = countActiveInvoiceFilters(filters) > 0;

  const stateLabel =
    INVOICE_STATE_OPTIONS.find((opt) => opt.value === filters.state)?.label ??
    filters.state;
  const paymentStatusLabel =
    INVOICE_PAYMENT_STATUS_OPTIONS.find(
      (opt) => opt.value === filters.paymentStatus,
    )?.label ?? filters.paymentStatus;

  return (
    <div className={cn("space-y-2", className)}>
      <ListPageSearchToolbar
        search={search}
        searchId="invoice-search"
        placeholder="Search by invoice number, client, or sales order…"
        searchTestId="invoices-search"
        searchSubmitTestId="invoices-search-submit"
        clearTestId="invoices-search-clear"
        isLoading={isLoading}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={onClearSearch}
        filter={
          <InvoiceFiltersSheet
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
          onClearAll={() => onFiltersApply(DEFAULT_INVOICE_LIST_FILTERS)}
        >
          {hasStateFilter ? (
            <ListPageFilterChip
              label={`State: ${stateLabel}`}
              disabled={isLoading}
              onRemove={() => onFiltersApply({ ...filters, state: "all" })}
            />
          ) : null}
          {hasPaymentStatusFilter ? (
            <ListPageFilterChip
              label={`Payment: ${paymentStatusLabel}`}
              disabled={isLoading}
              onRemove={() =>
                onFiltersApply({ ...filters, paymentStatus: "all" })
              }
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

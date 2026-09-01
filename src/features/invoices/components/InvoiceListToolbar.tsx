"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

import { ListPageSearchToolbar } from "@/features/app-shell/components/page-layout";
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
        placeholder="Search by invoice number, client, or sales order..."
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

          {hasPaymentStatusFilter ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={() => onFiltersApply({ ...filters, paymentStatus: "all" })}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-purple-200 bg-purple-50/80 px-2.5 py-0.5 text-purple-800 transition-colors hover:bg-purple-100"
            >
              <span>Payment: {paymentStatusLabel}</span>
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
            onClick={() => onFiltersApply(DEFAULT_INVOICE_LIST_FILTERS)}
            className="ml-1 text-[11px] font-medium text-brand-primary underline transition-colors hover:text-brand-primary-hover"
          >
            Clear all
          </button>
        </div>
      ) : null}
    </div>
  );
}

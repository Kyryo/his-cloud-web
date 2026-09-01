"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

import { ListPageSearchToolbar } from "@/features/app-shell/components/page-layout";
import { SalesOrderFiltersSheet } from "@/features/sales-orders/components/SalesOrderFiltersSheet";
import {
  countActiveSalesOrderFilters,
  DEFAULT_SALES_ORDER_LIST_FILTERS,
  SALES_ORDER_INVOICE_STATUS_OPTIONS,
  SALES_ORDER_STATE_OPTIONS,
  type SalesOrderListFilterState,
} from "@/features/sales-orders/utils/sales-order-list-filters";
import { cn } from "@/lib/utils";

type SalesOrderListToolbarProps = {
  search: string;
  filters: SalesOrderListFilterState;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: SalesOrderListFilterState) => void;
  trailing?: ReactNode;
  className?: string;
};

export function SalesOrderListToolbar({
  search,
  filters,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onFiltersApply,
  trailing,
  className,
}: SalesOrderListToolbarProps) {
  const hasStateFilter = filters.state !== "all";
  const hasInvoiceStatusFilter = filters.invoiceStatus !== "all";
  const hasProviderFilter = filters.providerId !== "all";
  const hasClinicFilter = filters.clinicId !== "all";
  const hasDateFilter = Boolean(filters.dateFrom || filters.dateTo);
  const hasAnyFilter = countActiveSalesOrderFilters(filters) > 0;

  const stateLabel =
    SALES_ORDER_STATE_OPTIONS.find((opt) => opt.value === filters.state)
      ?.label ?? filters.state;

  const invoiceStatusLabel =
    SALES_ORDER_INVOICE_STATUS_OPTIONS.find(
      (opt) => opt.value === filters.invoiceStatus,
    )?.label ?? filters.invoiceStatus;

  const handleRemoveState = () => {
    onFiltersApply({ ...filters, state: "all" });
  };

  const handleRemoveInvoiceStatus = () => {
    onFiltersApply({ ...filters, invoiceStatus: "all" });
  };

  const handleRemoveProvider = () => {
    onFiltersApply({ ...filters, providerId: "all" });
  };

  const handleRemoveClinic = () => {
    onFiltersApply({ ...filters, clinicId: "all" });
  };

  const handleRemoveDate = () => {
    onFiltersApply({ ...filters, dateFrom: "", dateTo: "" });
  };

  const handleClearAllFilters = () => {
    onFiltersApply(DEFAULT_SALES_ORDER_LIST_FILTERS);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <ListPageSearchToolbar
        search={search}
        searchId="sales-order-search"
        placeholder="Search by order number, client, provider, or reference..."
        searchTestId="sales-orders-search"
        searchSubmitTestId="sales-orders-search-submit"
        clearTestId="sales-orders-search-clear"
        isLoading={isLoading}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={onClearSearch}
        filter={
          <SalesOrderFiltersSheet
            filters={filters}
            isLoading={isLoading}
            onApply={onFiltersApply}
          />
        }
        trailing={trailing}
      />

      {/* Active Filter Chips Bar */}
      {hasAnyFilter ? (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-dash-muted mr-1">
            Active filters:
          </span>

          {hasStateFilter ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleRemoveState}
              className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50/80 px-2.5 py-0.5 text-blue-800 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <span>State: {stateLabel}</span>
              <X className="size-3" />
            </button>
          ) : null}

          {hasInvoiceStatusFilter ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleRemoveInvoiceStatus}
              className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50/80 px-2.5 py-0.5 text-purple-800 hover:bg-purple-100 transition-colors cursor-pointer"
            >
              <span>Invoice: {invoiceStatusLabel}</span>
              <X className="size-3" />
            </button>
          ) : null}

          {hasProviderFilter ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleRemoveProvider}
              className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50/80 px-2.5 py-0.5 text-teal-800 hover:bg-teal-100 transition-colors cursor-pointer"
            >
              <span>Provider filtered</span>
              <X className="size-3" />
            </button>
          ) : null}

          {hasClinicFilter ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleRemoveClinic}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100/90 px-2.5 py-0.5 text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <span>Clinic filtered</span>
              <X className="size-3" />
            </button>
          ) : null}

          {hasDateFilter ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleRemoveDate}
              className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50/80 px-2.5 py-0.5 text-amber-800 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <span>Date range filtered</span>
              <X className="size-3" />
            </button>
          ) : null}

          <button
            type="button"
            disabled={isLoading}
            onClick={handleClearAllFilters}
            className="ml-1 text-[11px] font-medium text-brand-primary underline hover:text-brand-primary-hover transition-colors"
          >
            Clear all
          </button>
        </div>
      ) : null}
    </div>
  );
}

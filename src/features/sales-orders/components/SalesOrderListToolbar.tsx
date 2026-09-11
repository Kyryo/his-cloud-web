"use client";

import type { ReactNode } from "react";

import {
  ListPageActiveFilters,
  ListPageFilterChip,
  ListPageSearchToolbar,
} from "@/features/app-shell/components/page-layout";
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
        placeholder="Search by order number, client, provider, or reference…"
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

      {hasAnyFilter ? (
        <ListPageActiveFilters
          disabled={isLoading}
          onClearAll={handleClearAllFilters}
        >
          {hasStateFilter ? (
            <ListPageFilterChip
              label={`State: ${stateLabel}`}
              disabled={isLoading}
              onRemove={handleRemoveState}
            />
          ) : null}
          {hasInvoiceStatusFilter ? (
            <ListPageFilterChip
              label={`Invoice: ${invoiceStatusLabel}`}
              disabled={isLoading}
              onRemove={handleRemoveInvoiceStatus}
            />
          ) : null}
          {hasProviderFilter ? (
            <ListPageFilterChip
              label="Provider filtered"
              disabled={isLoading}
              onRemove={handleRemoveProvider}
            />
          ) : null}
          {hasClinicFilter ? (
            <ListPageFilterChip
              label="Clinic filtered"
              disabled={isLoading}
              onRemove={handleRemoveClinic}
            />
          ) : null}
          {hasDateFilter ? (
            <ListPageFilterChip
              label="Date range filtered"
              disabled={isLoading}
              onRemove={handleRemoveDate}
            />
          ) : null}
        </ListPageActiveFilters>
      ) : null}
    </div>
  );
}

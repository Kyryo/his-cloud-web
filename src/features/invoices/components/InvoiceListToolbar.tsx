"use client";

import { ListPageSearchToolbar } from "@/features/app-shell/components/page-layout";
import { InvoiceFiltersSheet } from "@/features/invoices/components/InvoiceFiltersSheet";
import type { InvoiceListFilterState } from "@/features/invoices/utils/invoice-list-filters";

type InvoiceListToolbarProps = {
  search: string;
  filters: InvoiceListFilterState;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: InvoiceListFilterState) => void;
};

export function InvoiceListToolbar({
  search,
  filters,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onFiltersApply,
}: InvoiceListToolbarProps) {
  return (
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
    />
  );
}

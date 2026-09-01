"use client";

import { ListPageHeaderSection } from "@/features/app-shell/components/page-layout";
import { InvoiceListToolbar } from "@/features/invoices/components/InvoiceListToolbar";
import type { InvoiceListFilterState } from "@/features/invoices/utils/invoice-list-filters";

type InvoicesPageHeaderProps = {
  search: string;
  filters: InvoiceListFilterState;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: InvoiceListFilterState) => void;
};

export function InvoicesPageHeader({
  search,
  filters,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onFiltersApply,
}: InvoicesPageHeaderProps) {
  return (
    <ListPageHeaderSection>
      <InvoiceListToolbar
        search={search}
        filters={filters}
        isLoading={isLoading}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={onClearSearch}
        onFiltersApply={onFiltersApply}
      />
    </ListPageHeaderSection>
  );
}

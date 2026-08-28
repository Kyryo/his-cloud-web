"use client";

import { ListPageSearchToolbar } from "@/features/app-shell/components/page-layout";
import { PaymentFiltersSheet } from "@/features/payments/components/PaymentFiltersSheet";
import type { PaymentListFilterState } from "@/features/payments/utils/payment-list-filters";

type PaymentListToolbarProps = {
  search: string;
  filters: PaymentListFilterState;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: PaymentListFilterState) => void;
};

export function PaymentListToolbar({
  search,
  filters,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onFiltersApply,
}: PaymentListToolbarProps) {
  return (
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
    />
  );
}

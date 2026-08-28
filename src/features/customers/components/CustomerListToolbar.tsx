"use client";

import { ListPageSearchToolbar } from "@/features/app-shell/components/page-layout";
import { CustomerFiltersSheet } from "@/features/customers/components/CustomerFiltersSheet";
import type { CustomerListFilterState } from "@/features/customers/utils/customer-list-filters";

type CustomerListToolbarProps = {
  search: string;
  filters: Pick<
    CustomerListFilterState,
    "gender" | "activeStatus" | "ordering"
  >;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (
    filters: Pick<
      CustomerListFilterState,
      "gender" | "activeStatus" | "ordering"
    >,
  ) => void;
};

export function CustomerListToolbar({
  search,
  filters,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onFiltersApply,
}: CustomerListToolbarProps) {
  return (
    <ListPageSearchToolbar
      search={search}
      searchId="customer-search"
      placeholder="Search by name, ID, phone, email, or internal reference..."
      searchTestId="customers-search"
      searchSubmitTestId="customers-search-submit"
      clearTestId="customers-search-clear"
      isLoading={isLoading}
      onSearchChange={onSearchChange}
      onSearchSubmit={onSearchSubmit}
      onClearSearch={onClearSearch}
      filter={
        <CustomerFiltersSheet
          filters={filters}
          isLoading={isLoading}
          onApply={onFiltersApply}
        />
      }
    />
  );
}

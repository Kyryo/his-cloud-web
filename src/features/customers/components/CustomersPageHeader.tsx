"use client";

import { AppIcon } from "@/components/icons/app-icon";
import { Button } from "@/components/ui/button";
import { ListPageHeaderSection } from "@/features/app-shell/components/page-layout";
import { CustomerListToolbar } from "@/features/customers/components/CustomerListToolbar";
import type { CustomerListFilterState } from "@/features/customers/utils/customer-list-filters";

type CustomersPageHeaderProps = {
  search: string;
  filters: Pick<
    CustomerListFilterState,
    "gender" | "activeStatus" | "ordering" | "tags"
  >;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (
    filters: Pick<
      CustomerListFilterState,
      "gender" | "activeStatus" | "ordering" | "tags"
    >,
  ) => void;
  onAddClient: () => void;
};

export function CustomersPageHeader({
  search,
  filters,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onFiltersApply,
  onAddClient,
}: CustomersPageHeaderProps) {
  return (
    <ListPageHeaderSection>
      <CustomerListToolbar
        search={search}
        filters={filters}
        isLoading={isLoading}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={onClearSearch}
        onFiltersApply={onFiltersApply}
        trailing={
          <Button
            className="h-10 gap-1.5 rounded-lg bg-brand-primary text-sm font-medium text-white shadow-xs hover:bg-brand-primary-hover active:scale-[0.98] transition-all"
            onClick={onAddClient}
            data-testid="add-client-button"
          >
            <AppIcon name="add" className="size-4" />
            <span>Register client</span>
          </Button>
        }
      />
    </ListPageHeaderSection>
  );
}

"use client";

import { AppIcon } from "@/components/icons/app-icon";
import { PageActionButton } from "@/components/ui/app-buttons";
import { ACTIONS } from "@/constants/copy";
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
          <PageActionButton
            onClick={onAddClient}
            data-testid="add-client-button"
          >
            <AppIcon name="add" className="size-4" />
            <span>{ACTIONS.registerClient}</span>
          </PageActionButton>
        }
      />
    </ListPageHeaderSection>
  );
}

"use client";

import { AppIcon } from "@/components/icons/app-icon";
import { PageActionButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
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
  onSearchMembership?: () => void;
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
  onSearchMembership,
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
          <div className="flex items-center gap-2">
            {onSearchMembership ? (
              <Button
                type="button"
                variant="outline"
                className="h-8 gap-1 rounded-lg px-2"
                aria-label="Search and add by membership number"
                data-testid="membership-search-button"
                onClick={onSearchMembership}
              >
                <AppIcon name="search" size={14} />
                <AppIcon name="add" size={14} />
              </Button>
            ) : null}
            <PageActionButton
              onClick={onAddClient}
              data-testid="add-client-button"
            >
              <AppIcon name="add" className="size-3.5" />
              <span>{ACTIONS.registerClient}</span>
            </PageActionButton>
          </div>
        }
      />
    </ListPageHeaderSection>
  );
}

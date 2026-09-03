"use client";

import { AppIcon } from "@/components/icons/app-icon";
import { Button } from "@/components/ui/button";
import { ListPageHeaderSection } from "@/features/app-shell/components/page-layout";
import { SalesOrderListToolbar } from "@/features/sales-orders/components/SalesOrderListToolbar";
import type { SalesOrderListFilterState } from "@/features/sales-orders/utils/sales-order-list-filters";

type SalesOrdersPageHeaderProps = {
  search: string;
  filters: SalesOrderListFilterState;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: SalesOrderListFilterState) => void;
  onNewOrder: () => void;
};

export function SalesOrdersPageHeader({
  search,
  filters,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onFiltersApply,
  onNewOrder,
}: SalesOrdersPageHeaderProps) {
  return (
    <ListPageHeaderSection>
      <SalesOrderListToolbar
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
            onClick={onNewOrder}
            data-testid="new-sales-order-button"
          >
            <AppIcon name="add" className="size-4" />
            <span>New Order</span>
          </Button>
        }
      />
    </ListPageHeaderSection>
  );
}

"use client";

import Link from "next/link";

import { AppIcon } from "@/components/icons/app-icon";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
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
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden gap-1.5 rounded-lg border-dash-border text-xs text-brand-slate hover:border-emerald-300 hover:text-emerald-700 sm:inline-flex"
            >
              <Link href={ROUTES.activeVisits}>
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <AppIcon name="heartPulse" className="size-3.5 text-emerald-600" />
                <span>Active Queue</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden gap-1.5 rounded-lg border-dash-border text-xs text-brand-slate hover:border-blue-300 hover:text-blue-700 sm:inline-flex"
            >
              <Link href={ROUTES.customers}>
                <AppIcon name="users" className="size-3.5 text-blue-600" />
                <span>Clients</span>
              </Link>
            </Button>
            <Button
              size="sm"
              className="gap-1.5 rounded-lg bg-brand-primary text-xs font-medium text-white shadow-xs hover:bg-brand-primary-hover active:scale-[0.98] transition-all"
              onClick={onNewOrder}
              data-testid="new-sales-order-button"
            >
              <AppIcon name="add" className="size-3.5" />
              <span>New Order</span>
            </Button>
          </div>
        }
      />
    </ListPageHeaderSection>
  );
}

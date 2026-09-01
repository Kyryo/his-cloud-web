"use client";

import Link from "next/link";

import { AppIcon } from "@/components/icons/app-icon";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
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
              <Link href={ROUTES.appointments}>
                <AppIcon name="calendar" className="size-3.5 text-blue-600" />
                <span>Appointments</span>
              </Link>
            </Button>
            <Button
              size="sm"
              className="gap-1.5 rounded-lg bg-brand-primary text-xs font-medium text-white shadow-xs hover:bg-brand-primary-hover active:scale-[0.98] transition-all"
              onClick={onAddClient}
              data-testid="add-client-button"
            >
              <AppIcon name="add" className="size-3.5" />
              <span>Register Client</span>
            </Button>
          </div>
        }
      />
    </ListPageHeaderSection>
  );
}

"use client";

import { AppIcon } from "@/components/icons/app-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ListPageToolbarActions,
  ListPageToolbarSearch,
  ListPageToolbarSection,
} from "@/features/app-shell/components/page-layout";
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
    <ListPageToolbarSection className="lg:justify-start">
      <ListPageToolbarSearch className="flex">
        <div className="relative w-full sm:max-w-sm">
          <AppIcon
            name="search"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dash-muted"
            size={16}
          />
          <Input
            id="customer-search"
            type="search"
            placeholder="Search by name, ID, phone, or email..."
            value={search}
            disabled={isLoading}
            className="h-10 w-full rounded-lg border-dash-border bg-white pl-9"
            onChange={(event) => onSearchChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onSearchSubmit();
              }
            }}
            data-testid="customers-search"
          />
        </div>

        <ListPageToolbarActions>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            className="h-10 rounded-lg border-dash-border bg-white text-brand-slate"
            onClick={onSearchSubmit}
            data-testid="customers-search-submit"
          >
            Search
          </Button>
          <CustomerFiltersSheet
            filters={filters}
            isLoading={isLoading}
            onApply={onFiltersApply}
          />
          {search ? (
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              className="h-10 rounded-lg border-dash-border bg-white text-brand-slate"
              onClick={onClearSearch}
              data-testid="customers-search-clear"
            >
              Clear
            </Button>
          ) : null}
        </ListPageToolbarActions>
      </ListPageToolbarSearch>
    </ListPageToolbarSection>
  );
}

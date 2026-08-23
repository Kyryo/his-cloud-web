"use client";

import { AppIcon } from "@/components/icons/app-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ListPageToolbarActions,
  ListPageToolbarFilters,
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
    <ListPageToolbarSection>
      <ListPageToolbarSearch className="lg:order-2 lg:justify-end">
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
          {search ? (
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              className="h-10 rounded-lg border-dash-border bg-white text-brand-slate"
              onClick={onClearSearch}
            >
              Clear
            </Button>
          ) : null}
        </ListPageToolbarActions>
      </ListPageToolbarSearch>
      <ListPageToolbarFilters className="flex justify-end">
        <CustomerFiltersSheet
          filters={filters}
          isLoading={isLoading}
          onApply={onFiltersApply}
        />
      </ListPageToolbarFilters>
    </ListPageToolbarSection>
  );
}

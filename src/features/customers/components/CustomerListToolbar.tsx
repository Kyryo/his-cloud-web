"use client";

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
      <ListPageToolbarSearch>
        <Input
          id="customer-search"
          type="search"
          placeholder="Search by name, ID, phone, or email..."
          value={search}
          disabled={isLoading}
          className="w-full sm:max-w-md"
          onChange={(event) => onSearchChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSearchSubmit();
            }
          }}
          data-testid="customers-search"
        />

        <ListPageToolbarActions>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={onSearchSubmit}
            data-testid="customers-search-submit"
          >
            Search
          </Button>
          {search ? (
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={onClearSearch}
            >
              Clear
            </Button>
          ) : null}
        </ListPageToolbarActions>
      </ListPageToolbarSearch>

      <ListPageToolbarFilters>
        <CustomerFiltersSheet
          filters={filters}
          isLoading={isLoading}
          onApply={onFiltersApply}
        />
      </ListPageToolbarFilters>
    </ListPageToolbarSection>
  );
}

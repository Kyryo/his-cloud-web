"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ListPageToolbarActions,
  ListPageToolbarFilters,
  ListPageToolbarSearch,
  ListPageToolbarSection,
} from "@/features/app-shell/components/page-layout";
import { InvoiceFiltersSheet } from "@/features/invoices/components/InvoiceFiltersSheet";
import type { InvoiceListFilterState } from "@/features/invoices/utils/invoice-list-filters";

type InvoiceListToolbarProps = {
  search: string;
  filters: InvoiceListFilterState;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: InvoiceListFilterState) => void;
};

export function InvoiceListToolbar(props: InvoiceListToolbarProps) {
  const {
    search,
    filters,
    isLoading = false,
    onSearchChange,
    onSearchSubmit,
    onClearSearch,
    onFiltersApply,
  } = props;

  return (
    <ListPageToolbarSection>
      <ListPageToolbarSearch>
        <Input
          id="invoice-search"
          type="search"
          placeholder="Search by invoice number, client, or sales order..."
          value={search}
          disabled={isLoading}
          className="w-full sm:max-w-md"
          onChange={(event) => onSearchChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSearchSubmit();
            }
          }}
          data-testid="invoices-search"
        />
        <ListPageToolbarActions>
          <Button type="button" variant="outline" disabled={isLoading} onClick={onSearchSubmit}>
            Search
          </Button>
          {search ? (
            <Button type="button" variant="outline" disabled={isLoading} onClick={onClearSearch}>
              Clear
            </Button>
          ) : null}
        </ListPageToolbarActions>
      </ListPageToolbarSearch>
      <ListPageToolbarFilters>
        <InvoiceFiltersSheet
          filters={filters}
          isLoading={isLoading}
          onApply={onFiltersApply}
        />
      </ListPageToolbarFilters>
    </ListPageToolbarSection>
  );
}

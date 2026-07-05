"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ListPageToolbarActions,
  ListPageToolbarFilters,
  ListPageToolbarSearch,
  ListPageToolbarSection,
} from "@/features/app-shell/components/page-layout";
import { PaymentFiltersSheet } from "@/features/payments/components/PaymentFiltersSheet";
import type { PaymentListFilterState } from "@/features/payments/utils/payment-list-filters";

type PaymentListToolbarProps = {
  search: string;
  filters: PaymentListFilterState;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: PaymentListFilterState) => void;
};

export function PaymentListToolbar(props: PaymentListToolbarProps) {
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
          id="payment-search"
          type="search"
          placeholder="Search by payment reference, client, invoice, or method..."
          value={search}
          disabled={isLoading}
          className="w-full sm:max-w-md"
          onChange={(event) => onSearchChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSearchSubmit();
            }
          }}
          data-testid="payments-search"
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
        <PaymentFiltersSheet
          filters={filters}
          isLoading={isLoading}
          onApply={onFiltersApply}
        />
      </ListPageToolbarFilters>
    </ListPageToolbarSection>
  );
}

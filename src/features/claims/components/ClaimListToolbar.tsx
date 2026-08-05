"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClaimFiltersSheet } from "@/features/claims/components/ClaimFiltersSheet";
import type { ClaimListFilterState } from "@/features/claims/utils/claim-list-filters";
import {
  ListPageToolbarActions,
  ListPageToolbarFilters,
  ListPageToolbarSearch,
  ListPageToolbarSection,
} from "@/features/app-shell/components/page-layout";

type ClaimListToolbarProps = {
  search: string;
  filters: ClaimListFilterState;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: ClaimListFilterState) => void;
};

export function ClaimListToolbar(props: ClaimListToolbarProps) {
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
          id="claim-search"
          type="search"
          placeholder="Search membership, patient, invoice, claim #, payer…"
          value={search}
          disabled={isLoading}
          className="w-full sm:max-w-md"
          onChange={(event) => onSearchChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSearchSubmit();
            }
          }}
          data-testid="claims-search"
        />
        <ListPageToolbarActions>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={onSearchSubmit}
            data-testid="claims-search-submit"
          >
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
        <ClaimFiltersSheet
          filters={filters}
          isLoading={isLoading}
          onApply={onFiltersApply}
        />
      </ListPageToolbarFilters>
    </ListPageToolbarSection>
  );
}

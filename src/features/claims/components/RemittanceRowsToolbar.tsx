"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ListPageToolbarActions,
  ListPageToolbarSearch,
  ListPageToolbarSection,
} from "@/features/app-shell/components/page-layout";

type RemittanceRowsToolbarProps = {
  search: string;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
};

export function RemittanceRowsToolbar({
  search,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
}: RemittanceRowsToolbarProps) {
  return (
    <ListPageToolbarSection>
      <ListPageToolbarSearch>
        <Input
          id="remittance-rows-search"
          type="search"
          placeholder="Search by patient, member #, invoice, claim #, code, or reason…"
          value={search}
          disabled={isLoading}
          className="w-full sm:max-w-md"
          onChange={(event) => onSearchChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSearchSubmit();
            }
          }}
          data-testid="remittance-rows-search"
        />

        <ListPageToolbarActions>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={onSearchSubmit}
            data-testid="remittance-rows-search-submit"
          >
            Search
          </Button>
          {search ? (
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={onClearSearch}
              data-testid="remittance-rows-search-clear"
            >
              Clear
            </Button>
          ) : null}
        </ListPageToolbarActions>
      </ListPageToolbarSearch>
    </ListPageToolbarSection>
  );
}

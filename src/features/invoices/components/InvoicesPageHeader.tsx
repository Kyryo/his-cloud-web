"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ListPageHeaderMobileSearch,
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
} from "@/features/app-shell/components/page-layout";

type InvoicesPageHeaderProps = {
  search: string;
  isSearchDisabled?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
};

export function InvoicesPageHeader({
  search,
  isSearchDisabled = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
}: InvoicesPageHeaderProps) {
  return (
    <ListPageHeaderSection>
      <ListPageHeaderTopRow>
        <ListPageHeaderTitleBlock
          title="Invoices"
          description="Review posted customer invoices from ERP."
        />
      </ListPageHeaderTopRow>
      <ListPageHeaderMobileSearch>
        <Input
          id="invoice-search-mobile"
          type="search"
          placeholder="Search by invoice number..."
          value={search}
          disabled={isSearchDisabled}
          onChange={(event) => onSearchChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSearchSubmit();
            }
          }}
        />
        <Button type="button" variant="outline" className="w-full" disabled={isSearchDisabled} onClick={onSearchSubmit}>
          Search
        </Button>
        {search ? (
          <Button type="button" variant="outline" className="w-full" disabled={isSearchDisabled} onClick={onClearSearch}>
            Clear
          </Button>
        ) : null}
      </ListPageHeaderMobileSearch>
    </ListPageHeaderSection>
  );
}

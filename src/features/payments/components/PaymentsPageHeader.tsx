"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ListPageHeaderMobileSearch,
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
} from "@/features/app-shell/components/page-layout";

type PaymentsPageHeaderProps = {
  search: string;
  isSearchDisabled?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
};

export function PaymentsPageHeader({
  search,
  isSearchDisabled = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
}: PaymentsPageHeaderProps) {
  return (
    <ListPageHeaderSection>
      <ListPageHeaderTopRow>
        <ListPageHeaderTitleBlock
          title="Payments"
          description="Review customer payments recorded against invoices."
        />
      </ListPageHeaderTopRow>
      <ListPageHeaderMobileSearch>
        <Input
          id="payment-search-mobile"
          type="search"
          placeholder="Search by payment reference..."
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

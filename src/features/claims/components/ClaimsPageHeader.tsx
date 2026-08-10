"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ListPageHeaderMobileSearch,
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
} from "@/features/app-shell/components/page-layout";

type ClaimsPageHeaderProps = {
  search: string;
  isSearchDisabled?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
};

export function ClaimsPageHeader({
  search,
  isSearchDisabled = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
}: ClaimsPageHeaderProps) {
  return (
    <ListPageHeaderSection>
      <ListPageHeaderTopRow>
        <ListPageHeaderTitleBlock
          title="Submissions"
          description="Track insurance claims from draft through submission."
        />
      </ListPageHeaderTopRow>
      <ListPageHeaderMobileSearch>
        <Input
          id="claim-search-mobile"
          type="search"
          placeholder="Search membership, patient, invoice, claim #, payer…"
          value={search}
          disabled={isSearchDisabled}
          onChange={(event) => onSearchChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSearchSubmit();
            }
          }}
          data-testid="claims-search-mobile"
        />
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isSearchDisabled}
          onClick={onSearchSubmit}
          data-testid="claims-search-submit-mobile"
        >
          Search
        </Button>
        {search ? (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isSearchDisabled}
            onClick={onClearSearch}
          >
            Clear
          </Button>
        ) : null}
      </ListPageHeaderMobileSearch>
    </ListPageHeaderSection>
  );
}

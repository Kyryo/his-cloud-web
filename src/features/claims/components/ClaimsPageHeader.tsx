"use client";

import { AddActionButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ListPageHeaderActions,
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
  onCreateClaim?: () => void;
};

export function ClaimsPageHeader({
  search,
  isSearchDisabled = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onCreateClaim,
}: ClaimsPageHeaderProps) {
  return (
    <ListPageHeaderSection>
      <ListPageHeaderTopRow>
        <ListPageHeaderTitleBlock
          title="Claims"
          description="Track insurance claims from draft through submission."
        />

        {onCreateClaim ? (
          <ListPageHeaderActions>
            <AddActionButton
              label="Create claim"
              showIcon={false}
              className="hidden shrink-0 self-start sm:inline-flex"
              onClick={onCreateClaim}
              data-testid="claims-create-button"
            />
          </ListPageHeaderActions>
        ) : null}
      </ListPageHeaderTopRow>
      <ListPageHeaderMobileSearch>
        <Input
          id="claim-search-mobile"
          type="search"
          placeholder="Search by membership number..."
          value={search}
          disabled={isSearchDisabled}
          onChange={(event) => onSearchChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSearchSubmit();
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isSearchDisabled}
          onClick={onSearchSubmit}
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
        {onCreateClaim ? (
          <AddActionButton
            label="Create claim"
            showIcon={false}
            className="w-full sm:hidden"
            onClick={onCreateClaim}
            data-testid="claims-create-button-mobile"
          />
        ) : null}
      </ListPageHeaderMobileSearch>
    </ListPageHeaderSection>
  );
}

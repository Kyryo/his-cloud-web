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

type CustomersPageHeaderProps = {
  onAddClient: () => void;
  search: string;
  isSearchDisabled?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
};

export function CustomersPageHeader({
  onAddClient,
  search,
  isSearchDisabled = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
}: CustomersPageHeaderProps) {
  return (
    <ListPageHeaderSection>
      <ListPageHeaderTopRow>
        <ListPageHeaderTitleBlock
          title="Clients"
          description="Manage client registrations, visits, and activity."
        />

        <ListPageHeaderActions>
          <AddActionButton
            label="Add client"
            className="hidden shrink-0 self-start sm:inline-flex"
            onClick={onAddClient}
            data-testid="add-client-button"
          />
        </ListPageHeaderActions>
      </ListPageHeaderTopRow>

      <ListPageHeaderMobileSearch>
        <Input
          id="customer-search-mobile"
          type="search"
          placeholder="Search clients..."
          value={search}
          disabled={isSearchDisabled}
          onChange={(event) => onSearchChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSearchSubmit();
            }
          }}
          data-testid="customers-search-mobile"
        />
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isSearchDisabled}
          onClick={onSearchSubmit}
          data-testid="customers-search-submit-mobile"
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

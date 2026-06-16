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

type SalesOrdersPageHeaderProps = {
  onNewOrder: () => void;
  search: string;
  isSearchDisabled?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
};

export function SalesOrdersPageHeader({
  onNewOrder,
  search,
  isSearchDisabled = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
}: SalesOrdersPageHeaderProps) {
  return (
    <ListPageHeaderSection>
      <ListPageHeaderTopRow>
        <ListPageHeaderTitleBlock
          title="Sales orders"
          description="Review quotations and confirmed orders synced from ERP."
        />

        <ListPageHeaderActions>
          <AddActionButton
            label="New order"
            className="hidden shrink-0 self-start sm:inline-flex"
            onClick={onNewOrder}
            data-testid="new-sales-order-button"
          />
        </ListPageHeaderActions>
      </ListPageHeaderTopRow>

      <ListPageHeaderMobileSearch>
        <Input
          id="sales-order-search-mobile"
          type="search"
          placeholder="Search by order number..."
          value={search}
          disabled={isSearchDisabled}
          onChange={(event) => onSearchChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSearchSubmit();
            }
          }}
          data-testid="sales-orders-search-mobile"
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
      </ListPageHeaderMobileSearch>
    </ListPageHeaderSection>
  );
}

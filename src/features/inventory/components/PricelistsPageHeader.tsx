"use client";

import { AppIcon } from "@/components/icons/app-icon";
import { Button } from "@/components/ui/button";
import {
  ListPageHeaderSection,
  ListPageSearchToolbar,
} from "@/features/app-shell/components/page-layout";

type PricelistsPageHeaderProps = {
  search: string;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onNewPricelist: () => void;
};

export function PricelistsPageHeader({
  search,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onNewPricelist,
}: PricelistsPageHeaderProps) {
  return (
    <ListPageHeaderSection>
      <ListPageSearchToolbar
        search={search}
        searchId="inventory-pricelists-search"
        placeholder="Search by name..."
        searchTestId="inventory-pricelists-search"
        searchSubmitTestId="inventory-pricelists-search-submit"
        clearTestId="inventory-pricelists-search-clear"
        isLoading={isLoading}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={onClearSearch}
        trailing={
          <Button
            size="sm"
            className="gap-1.5 rounded-lg bg-brand-primary text-xs font-medium text-white shadow-xs transition-all hover:bg-brand-primary-hover active:scale-[0.98]"
            onClick={onNewPricelist}
            data-testid="add-pricelist-button"
          >
            <AppIcon name="add" className="size-3.5" />
            <span>New Pricelist</span>
          </Button>
        }
      />
    </ListPageHeaderSection>
  );
}

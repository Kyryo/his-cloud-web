"use client";

import type { ReactNode } from "react";

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

type InventoryListPageHeaderProps = {
  title: string;
  description: string;
  addLabel?: string;
  onAdd?: () => void;
  search?: string;
  isSearchDisabled?: boolean;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
  onClearSearch?: () => void;
  searchPlaceholder?: string;
  headerActions?: ReactNode;
  "data-testid"?: string;
};

export function InventoryListPageHeader({
  title,
  description,
  addLabel,
  onAdd,
  search = "",
  isSearchDisabled = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  searchPlaceholder = "Search...",
  headerActions,
  "data-testid": dataTestId,
}: InventoryListPageHeaderProps) {
  const showSearch = Boolean(onSearchChange && onSearchSubmit);

  return (
    <ListPageHeaderSection>
      <ListPageHeaderTopRow>
        <ListPageHeaderTitleBlock title={title} description={description} />

        <ListPageHeaderActions>
          {headerActions}
          {addLabel && onAdd ? (
            <AddActionButton
              label={addLabel}
              className="hidden shrink-0 self-start sm:inline-flex"
              onClick={onAdd}
              data-testid={dataTestId}
            />
          ) : null}
        </ListPageHeaderActions>
      </ListPageHeaderTopRow>

      {showSearch ? (
        <ListPageHeaderMobileSearch>
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={search}
            disabled={isSearchDisabled}
            onChange={(event) => onSearchChange?.(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onSearchSubmit?.();
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
        </ListPageHeaderMobileSearch>
      ) : null}
    </ListPageHeaderSection>
  );
}

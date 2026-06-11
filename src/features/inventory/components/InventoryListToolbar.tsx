"use client";

import { RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ListPageToolbarActions,
  ListPageToolbarFilters,
  ListPageToolbarSearch,
  ListPageToolbarSection,
} from "@/features/app-shell/components/page-layout";

type InventoryListToolbarProps = {
  search?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
  onClearSearch?: () => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  filters?: ReactNode;
  primaryAction?: ReactNode;
  showSearch?: boolean;
};

export function InventoryListToolbar({
  search = "",
  searchPlaceholder = "Search...",
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  isLoading = false,
  onRefresh,
  filters,
  primaryAction,
  showSearch = true,
}: InventoryListToolbarProps) {
  return (
    <ListPageToolbarSection>
      {showSearch && onSearchChange && onSearchSubmit ? (
        <ListPageToolbarSearch>
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={search}
            disabled={isLoading}
            className="w-full sm:max-w-md"
            onChange={(event) => onSearchChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onSearchSubmit();
              }
            }}
          />
          <ListPageToolbarActions>
            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={onSearchSubmit}
            >
              Search
            </Button>
            {search && onClearSearch ? (
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={onClearSearch}
              >
                Clear
              </Button>
            ) : null}
          </ListPageToolbarActions>
        </ListPageToolbarSearch>
      ) : null}

      <ListPageToolbarFilters>
        {filters}
        {onRefresh ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={onRefresh}
          >
            <RefreshCw className="mr-2 size-4" aria-hidden="true" />
            Refresh
          </Button>
        ) : null}
        {primaryAction}
      </ListPageToolbarFilters>
    </ListPageToolbarSection>
  );
}

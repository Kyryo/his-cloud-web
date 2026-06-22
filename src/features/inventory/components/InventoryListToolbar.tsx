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
  filtersClassName?: string;
  primaryAction?: ReactNode;
  showSearch?: boolean;
  compact?: boolean;
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
  filtersClassName,
  primaryAction,
  showSearch = true,
  compact = false,
}: InventoryListToolbarProps) {
  return (
    <ListPageToolbarSection className={compact ? "gap-2 lg:gap-3" : undefined}>
      {showSearch && onSearchChange && onSearchSubmit ? (
        <ListPageToolbarSearch className={compact ? "gap-1.5" : undefined}>
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={search}
            disabled={isLoading}
            className={compact ? "h-9 w-full text-sm sm:max-w-sm" : "w-full sm:max-w-md"}
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
              size={compact ? "sm" : "default"}
              disabled={isLoading}
              onClick={onSearchSubmit}
            >
              Search
            </Button>
            {search && onClearSearch ? (
              <Button
                type="button"
                variant="outline"
                size={compact ? "sm" : "default"}
                disabled={isLoading}
                onClick={onClearSearch}
              >
                Clear
              </Button>
            ) : null}
          </ListPageToolbarActions>
        </ListPageToolbarSearch>
      ) : null}

      <ListPageToolbarFilters className={filtersClassName}>
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

"use client";

import type { ReactNode } from "react";

import { AppIcon } from "@/components/icons/app-icon";
import { Button } from "@/components/ui/button";
import { ListPageHeaderSection } from "@/features/app-shell/components/page-layout";
import { InventoryListSearchToolbar } from "@/features/inventory/components/InventoryListSearchToolbar";
import type {
  InventoryListSearchFilters,
  InventoryListSearchVariant,
} from "@/features/inventory/utils/inventory-list-filter-chips";

type InventoryListPageHeaderBarProps = {
  variant: InventoryListSearchVariant;
  search: string;
  filters: InventoryListSearchFilters;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: InventoryListSearchFilters) => void;
  trailing?: ReactNode;
};

export function InventoryListPageHeaderBar({
  variant,
  search,
  filters,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onFiltersApply,
  trailing,
}: InventoryListPageHeaderBarProps) {
  return (
    <ListPageHeaderSection>
      <InventoryListSearchToolbar
        variant={variant}
        search={search}
        filters={filters}
        isLoading={isLoading}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={onClearSearch}
        onFiltersApply={onFiltersApply}
        trailing={trailing}
      />
    </ListPageHeaderSection>
  );
}

type InventoryListPrimaryActionProps = {
  label: string;
  onClick: () => void;
  "data-testid"?: string;
};

export function InventoryListPrimaryAction({
  label,
  onClick,
  "data-testid": dataTestId,
}: InventoryListPrimaryActionProps) {
  return (
    <Button
      size="sm"
      className="gap-1.5 rounded-lg bg-brand-primary text-xs font-medium text-white shadow-xs transition-all hover:bg-brand-primary-hover active:scale-[0.98]"
      onClick={onClick}
      data-testid={dataTestId}
    >
      <AppIcon name="add" className="size-3.5" />
      <span>{label}</span>
    </Button>
  );
}

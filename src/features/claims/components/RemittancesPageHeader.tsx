"use client";

import { AppIcon } from "@/components/icons/app-icon";
import { Button } from "@/components/ui/button";
import { ListPageHeaderSection } from "@/features/app-shell/components/page-layout";
import { RemittanceListToolbar } from "@/features/claims/components/RemittanceListToolbar";
import type { RemittanceListFilterState } from "@/features/claims/utils/remittance-list-filters";

type RemittancesPageHeaderProps = {
  search: string;
  filters: RemittanceListFilterState;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: RemittanceListFilterState) => void;
  onUploadClick: () => void;
};

export function RemittancesPageHeader({
  search,
  filters,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onFiltersApply,
  onUploadClick,
}: RemittancesPageHeaderProps) {
  return (
    <ListPageHeaderSection>
      <RemittanceListToolbar
        search={search}
        filters={filters}
        isLoading={isLoading}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={onClearSearch}
        onFiltersApply={onFiltersApply}
        trailing={
          <Button
            className="h-10 gap-1.5 rounded-lg bg-brand-primary text-sm font-medium text-white shadow-xs transition-all hover:bg-brand-primary-hover active:scale-[0.98]"
            onClick={onUploadClick}
            data-testid="remittance-upload-open"
          >
            <AppIcon name="add" className="size-4" />
            <span>Upload remittance</span>
          </Button>
        }
      />
    </ListPageHeaderSection>
  );
}

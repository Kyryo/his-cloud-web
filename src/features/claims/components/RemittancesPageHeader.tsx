"use client";

import { AppIcon } from "@/components/icons/app-icon";
import { PageActionButton } from "@/components/ui/app-buttons";
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
          <PageActionButton
            onClick={onUploadClick}
            data-testid="remittance-upload-open"
          >
            <AppIcon name="add" className="size-3.5" />
            <span>Upload remittance</span>
          </PageActionButton>
        }
      />
    </ListPageHeaderSection>
  );
}

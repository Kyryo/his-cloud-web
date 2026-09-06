"use client";

import { ListPageHeaderSection } from "@/features/app-shell/components/page-layout";
import { RejectionListToolbar } from "@/features/claims/components/RejectionListToolbar";
import type { RejectionListFilterState } from "@/features/claims/utils/rejection-list-filters";

type RejectionsPageHeaderProps = {
  search: string;
  filters: RejectionListFilterState;
  isLoading?: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  onFiltersApply: (filters: RejectionListFilterState) => void;
};

export function RejectionsPageHeader({
  search,
  filters,
  isLoading = false,
  onSearchChange,
  onSearchSubmit,
  onClearSearch,
  onFiltersApply,
}: RejectionsPageHeaderProps) {
  return (
    <ListPageHeaderSection>
      <RejectionListToolbar
        search={search}
        filters={filters}
        isLoading={isLoading}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
        onClearSearch={onClearSearch}
        onFiltersApply={onFiltersApply}
      />
    </ListPageHeaderSection>
  );
}

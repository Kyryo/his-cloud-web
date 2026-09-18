"use client";

import { ListPageHeaderSection } from "@/features/app-shell/components/page-layout";
import { LabOrderListToolbar } from "@/features/laboratory/components/LabOrderListToolbar";
import type { LabOrderListUrlState } from "@/features/laboratory/utils/lab-order-list-url";

type LabOrdersPageHeaderProps = {
  accession: string;
  filters: LabOrderListUrlState;
  isLoading?: boolean;
  onAccessionChange: (value: string) => void;
  onAccessionSubmit: () => void;
  onClearAccession: () => void;
  onFiltersApply: (filters: LabOrderListUrlState) => void;
};

export function LabOrdersPageHeader({
  accession,
  filters,
  isLoading = false,
  onAccessionChange,
  onAccessionSubmit,
  onClearAccession,
  onFiltersApply,
}: LabOrdersPageHeaderProps) {
  return (
    <ListPageHeaderSection>
      <LabOrderListToolbar
        accession={accession}
        filters={filters}
        isLoading={isLoading}
        onAccessionChange={onAccessionChange}
        onAccessionSubmit={onAccessionSubmit}
        onClearAccession={onClearAccession}
        onFiltersApply={onFiltersApply}
      />
    </ListPageHeaderSection>
  );
}

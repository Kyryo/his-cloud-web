"use client";

import {
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
} from "@/features/app-shell/components/page-layout";
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
      <ListPageHeaderTopRow>
        <ListPageHeaderTitleBlock
          title="Laboratory orders"
          description="Accession, collect specimens, and release results."
        />
      </ListPageHeaderTopRow>
      <div className="mt-3">
        <LabOrderListToolbar
          accession={accession}
          filters={filters}
          isLoading={isLoading}
          onAccessionChange={onAccessionChange}
          onAccessionSubmit={onAccessionSubmit}
          onClearAccession={onClearAccession}
          onFiltersApply={onFiltersApply}
        />
      </div>
    </ListPageHeaderSection>
  );
}

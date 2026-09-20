"use client";

import {
  DetailPageAsidePanelHeader,
  DetailPageAsidePanelSection,
  DetailPageAsideSummaryField,
  DetailPageAsideSummarySection,
} from "@/features/app-shell/components/page-layout";
import type { LabTestDefinition } from "@/features/laboratory/types/laboratory-catalog.types";
import { formatLabDisplayDateTime } from "@/features/laboratory/utils/format-lab-order";

type LabTestSummaryPanelProps = {
  test: LabTestDefinition;
  className?: string;
};

export function LabTestSummaryPanel({
  test,
  className,
}: LabTestSummaryPanelProps) {
  return (
    <DetailPageAsidePanelSection
      className={className}
      data-testid="lab-test-summary-panel"
    >
      <DetailPageAsidePanelHeader title="Test summary" />
      <DetailPageAsideSummarySection title="Details">
        <DetailPageAsideSummaryField label="Code" value={test.code} />
        <DetailPageAsideSummaryField
          label="Category"
          value={test.category?.trim() || "—"}
        />
        <DetailPageAsideSummaryField
          label="Turnaround"
          value={
            test.turnaround_hours != null
              ? `${test.turnaround_hours} hour${test.turnaround_hours === 1 ? "" : "s"}`
              : "—"
          }
        />
        <DetailPageAsideSummaryField
          label="Specimen"
          value={test.primary_specimen_type_code?.trim() || "—"}
        />
        <DetailPageAsideSummaryField
          label="Product"
          value={test.product?.name?.trim() || "—"}
        />
        <DetailPageAsideSummaryField
          label="Analytes"
          value={String(test.analytes?.length ?? 0)}
        />
        <DetailPageAsideSummaryField
          label="Updated"
          value={formatLabDisplayDateTime(test.updated_at)}
        />
      </DetailPageAsideSummarySection>
    </DetailPageAsidePanelSection>
  );
}

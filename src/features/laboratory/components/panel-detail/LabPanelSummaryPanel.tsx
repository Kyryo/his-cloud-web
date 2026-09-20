"use client";

import {
  DetailPageAsidePanelHeader,
  DetailPageAsidePanelSection,
  DetailPageAsideSummaryField,
  DetailPageAsideSummarySection,
} from "@/features/app-shell/components/page-layout";
import type { LabPanel } from "@/features/laboratory/types/laboratory-catalog.types";
import { formatLabDisplayDateTime } from "@/features/laboratory/utils/format-lab-order";

type LabPanelSummaryPanelProps = {
  panel: LabPanel;
  className?: string;
};

export function LabPanelSummaryPanel({
  panel,
  className,
}: LabPanelSummaryPanelProps) {
  return (
    <DetailPageAsidePanelSection
      className={className}
      data-testid="lab-panel-summary-panel"
    >
      <DetailPageAsidePanelHeader title="Panel summary" />
      <DetailPageAsideSummarySection title="Details">
        <DetailPageAsideSummaryField label="Code" value={panel.code} />
        <DetailPageAsideSummaryField
          label="Product"
          value={panel.product?.name?.trim() || "—"}
        />
        <DetailPageAsideSummaryField
          label="Tests"
          value={String(panel.tests?.length ?? 0)}
        />
        <DetailPageAsideSummaryField
          label="Updated"
          value={formatLabDisplayDateTime(panel.updated_at)}
        />
      </DetailPageAsideSummarySection>
    </DetailPageAsidePanelSection>
  );
}

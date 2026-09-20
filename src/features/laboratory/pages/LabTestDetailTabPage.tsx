"use client";

import { LabTestActivityTabPanel } from "@/features/laboratory/components/test-detail/LabTestActivityTabPanel";
import { LabTestAnalytesTabPanel } from "@/features/laboratory/components/test-detail/LabTestAnalytesTabPanel";
import { LabTestReferenceRangesTabPanel } from "@/features/laboratory/components/test-detail/LabTestReferenceRangesTabPanel";
import { LabTestSummaryTabPanel } from "@/features/laboratory/components/test-detail/LabTestSummaryTabPanel";
import type { LabTestDetailTabId } from "@/features/laboratory/utils/lab-test-detail-tabs";

type LabTestDetailTabPageProps = {
  tab: LabTestDetailTabId;
};

export function LabTestDetailTabPage({ tab }: LabTestDetailTabPageProps) {
  switch (tab) {
    case "analytes":
      return <LabTestAnalytesTabPanel />;
    case "reference-ranges":
      return <LabTestReferenceRangesTabPanel />;
    case "activity":
      return <LabTestActivityTabPanel />;
    case "summary":
    default:
      return <LabTestSummaryTabPanel />;
  }
}

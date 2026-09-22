"use client";

import { LabOrderOverviewPanel } from "@/features/laboratory/components/detail/LabOrderOverviewPanel";
import { LabOrderResultsPanel } from "@/features/laboratory/components/detail/LabOrderResultsPanel";
import { LabOrderSpecimensPanel } from "@/features/laboratory/components/detail/LabOrderSpecimensPanel";
import type { LabOrderDetailTabId } from "@/features/laboratory/utils/lab-order-detail-tabs";

type LabOrderDetailTabPageProps = {
  tab: LabOrderDetailTabId;
};

export function LabOrderDetailTabPage({ tab }: LabOrderDetailTabPageProps) {
  switch (tab) {
    case "specimens":
      return <LabOrderSpecimensPanel />;
    case "results":
      return <LabOrderResultsPanel />;
    case "overview":
    default:
      return <LabOrderOverviewPanel />;
  }
}

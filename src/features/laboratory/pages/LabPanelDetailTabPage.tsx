"use client";

import { LabPanelActivityTabPanel } from "@/features/laboratory/components/panel-detail/LabPanelActivityTabPanel";
import { LabPanelOverviewTabPanel } from "@/features/laboratory/components/panel-detail/LabPanelOverviewTabPanel";
import { LabPanelTestsTabPanel } from "@/features/laboratory/components/panel-detail/LabPanelTestsTabPanel";
import type { LabPanelDetailTabId } from "@/features/laboratory/utils/lab-panel-detail-tabs";

type LabPanelDetailTabPageProps = {
  tab: LabPanelDetailTabId;
};

export function LabPanelDetailTabPage({ tab }: LabPanelDetailTabPageProps) {
  switch (tab) {
    case "tests":
      return <LabPanelTestsTabPanel />;
    case "activity":
      return <LabPanelActivityTabPanel />;
    case "overview":
    default:
      return <LabPanelOverviewTabPanel />;
  }
}

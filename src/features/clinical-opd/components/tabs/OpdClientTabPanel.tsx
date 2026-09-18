"use client";

import { OpdEncounterSummaryPanel } from "@/features/clinical-opd/components/detail/OpdEncounterSummaryPanel";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";

type OpdClientTabPanelProps = {
  isActive?: boolean;
};

export function OpdClientTabPanel({ isActive = true }: OpdClientTabPanelProps) {
  const { customer } = useOpdEncounterWorkspace();

  if (!isActive) {
    return null;
  }

  return (
    <OpdEncounterSummaryPanel
      customer={customer}
      variant="tab"
      data-testid="opd-client-tab-panel"
    />
  );
}

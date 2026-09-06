"use client";

import { OpdEncounterSummaryPanel } from "@/features/clinical-opd/components/detail/OpdEncounterSummaryPanel";
import { OpdPhysicianTabShell } from "@/features/clinical-opd/components/detail/OpdPhysicianTabShell";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";

type OpdClientTabPanelProps = {
  isActive?: boolean;
};

export function OpdClientTabPanel({ isActive = true }: OpdClientTabPanelProps) {
  const { visitUuid, encounterUuid, customer } = useOpdEncounterWorkspace();

  if (!isActive) {
    return null;
  }

  return (
    <OpdPhysicianTabShell visitUuid={visitUuid} encounterUuid={encounterUuid}>
      <OpdEncounterSummaryPanel
        customer={customer}
        variant="tab"
        data-testid="opd-client-tab-panel"
      />
    </OpdPhysicianTabShell>
  );
}

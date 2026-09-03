"use client";

import { ClipboardList } from "lucide-react";

import { OpdEncounterTabEmptyState } from "@/features/clinical-opd/components/detail/OpdEncounterTabEmptyState";
import { OpdPhysicianTabShell } from "@/features/clinical-opd/components/detail/OpdPhysicianTabShell";

type OpdOrdersTabPanelProps = {
  visitUuid: string;
  encounterUuid: string;
  isActive?: boolean;
};

export function OpdOrdersTabPanel({
  visitUuid,
  encounterUuid,
  isActive = true,
}: OpdOrdersTabPanelProps) {
  if (!isActive) {
    return null;
  }

  return (
    <OpdPhysicianTabShell visitUuid={visitUuid} encounterUuid={encounterUuid}>
      <OpdEncounterTabEmptyState
        icon={ClipboardList}
        title="No orders recorded"
        description="Laboratory, radiology, procedure, and other clinical orders for this encounter will appear here."
        data-testid="opd-orders-empty-state"
      />
    </OpdPhysicianTabShell>
  );
}

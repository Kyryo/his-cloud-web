"use client";

import { OpdEncounterActivityLog } from "@/features/clinical-opd/components/detail/OpdEncounterActivityLog";
import { OpdEncounterTabSkeleton } from "@/features/clinical-opd/components/detail/OpdEncounterTabSkeleton";
import { OpdPhysicianTabShell } from "@/features/clinical-opd/components/detail/OpdPhysicianTabShell";
import { useEncounterWorkspace } from "@/features/clinical-opd/hooks/use-clinical-opd";

type OpdActivityTabPanelProps = {
  visitUuid: string;
  encounterUuid: string;
  isActive?: boolean;
};

export function OpdActivityTabPanel({
  visitUuid,
  encounterUuid,
  isActive = true,
}: OpdActivityTabPanelProps) {
  const { timeline } = useEncounterWorkspace(visitUuid, encounterUuid);

  if (!isActive) {
    return null;
  }

  if (timeline.isLoading) {
    return <OpdEncounterTabSkeleton rows={4} />;
  }

  return (
    <OpdPhysicianTabShell visitUuid={visitUuid} encounterUuid={encounterUuid}>
      <OpdEncounterActivityLog
        events={timeline.data ?? []}
        isLoading={timeline.isLoading}
      />
    </OpdPhysicianTabShell>
  );
}

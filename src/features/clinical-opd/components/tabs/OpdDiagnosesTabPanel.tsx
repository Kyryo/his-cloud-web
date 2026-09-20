"use client";

import { useQueryClient } from "@tanstack/react-query";

import { EncounterDiagnosisPanel } from "@/features/clinical/components/EncounterDiagnosisPanel";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import { OpdEncounterTabSkeleton } from "@/features/clinical-opd/components/detail/OpdEncounterTabSkeleton";

type OpdDiagnosesTabPanelProps = {
  visitUuid: string;
  encounterUuid: string;
  isActive?: boolean;
};

export function OpdDiagnosesTabPanel({
  visitUuid,
  encounterUuid,
  isActive = true,
}: OpdDiagnosesTabPanelProps) {
  const queryClient = useQueryClient();
  const { isChartLocked } = useOpdEncounterWorkspace();

  if (!isActive) {
    return null;
  }

  if (!visitUuid || !encounterUuid) {
    return <OpdEncounterTabSkeleton rows={4} />;
  }

  return (
    <EncounterDiagnosisPanel
      visitUuid={visitUuid}
      encounterUuid={encounterUuid}
      sourcePlatform="CLINICAL"
      readOnly={isChartLocked}
      onDiagnosesChanged={async () => {
        await queryClient.invalidateQueries({ queryKey: ["opd-queue"] });
        await queryClient.invalidateQueries({
          queryKey: ["encounter-timeline", visitUuid, encounterUuid],
        });
      }}
    />
  );
}

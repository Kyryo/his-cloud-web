"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { AddEncounterDiagnosisInlineForm } from "@/features/clinical/components/AddEncounterDiagnosisDialog";
import { EncounterDiagnosisPanel } from "@/features/clinical/components/EncounterDiagnosisPanel";
import {
  OpdConsultContentPanel,
  OpdConsultFormLocked,
  OpdConsultFormPanel,
  OpdConsultLayout,
} from "@/features/clinical-opd/components/detail/OpdConsultLayout";
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
  const [listRevision, setListRevision] = useState(0);

  if (!isActive) {
    return null;
  }

  if (!visitUuid || !encounterUuid) {
    return <OpdEncounterTabSkeleton rows={4} />;
  }

  async function handleDiagnosesChanged() {
    setListRevision((current) => current + 1);
    await queryClient.invalidateQueries({ queryKey: ["opd-queue"] });
    await queryClient.invalidateQueries({
      queryKey: ["encounter-timeline", visitUuid, encounterUuid],
    });
  }

  return (
    <OpdConsultLayout
      historySection="diagnoses"
      form={
        <OpdConsultFormPanel
          title="Add diagnosis"
          description="Search ICD-10 and record the working diagnosis for this visit."
        >
          {isChartLocked ? (
            <OpdConsultFormLocked message="This chart is locked. Diagnoses can still be reviewed for this encounter." />
          ) : (
            <AddEncounterDiagnosisInlineForm
              visitUuid={visitUuid}
              encounterUuid={encounterUuid}
              onSuccess={handleDiagnosesChanged}
            />
          )}
        </OpdConsultFormPanel>
      }
      content={
        <OpdConsultContentPanel title="Diagnoses">
          <EncounterDiagnosisPanel
            key={listRevision}
            visitUuid={visitUuid}
            encounterUuid={encounterUuid}
            sourcePlatform="CLINICAL"
            readOnly={isChartLocked}
            hideAddButton
            onDiagnosesChanged={handleDiagnosesChanged}
          />
        </OpdConsultContentPanel>
      }
    />
  );
}

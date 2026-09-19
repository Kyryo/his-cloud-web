"use client";

import type { ReactNode } from "react";

import { OpdComplaintComposer } from "@/features/clinical-opd/components/detail/OpdComplaintComposer";
import { OpdExamComposer } from "@/features/clinical-opd/components/detail/OpdExamComposer";
import { OpdNoteComposer } from "@/features/clinical-opd/components/detail/OpdNoteComposer";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import {
  useChiefComplaints,
  useEncounterWorkspace,
} from "@/features/clinical-opd/hooks/use-clinical-opd";

function SoapBlock({
  mark,
  title,
  children,
}: {
  mark: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 py-5 first:pt-0">
      <p
        className="pt-0.5 text-sm font-semibold leading-6 text-brand-primary"
        aria-hidden="true"
      >
        {mark}
      </p>
      <div className="min-w-0 space-y-3">
        <h2 className="text-sm font-semibold text-brand-navy">{title}</h2>
        {children}
      </div>
    </section>
  );
}

type OpdConsultChartProps = {
  visitUuid: string;
  encounterUuid: string;
};

export function OpdConsultChart({
  visitUuid,
  encounterUuid,
}: OpdConsultChartProps) {
  const { isChartLocked, capabilities } = useOpdEncounterWorkspace();
  const complaints = useChiefComplaints(visitUuid, encounterUuid);
  const { physicalExams } = useEncounterWorkspace(visitUuid, encounterUuid);

  const canWriteComplaint =
    capabilities.includes("record_chief_complaint") && !isChartLocked;
  const canWriteHpi = capabilities.includes("record_hpi") && !isChartLocked;
  const canWriteExam =
    capabilities.includes("record_physical_exam") && !isChartLocked;
  const canWriteNote =
    capabilities.includes("record_clinical_note") && !isChartLocked;
  const canWriteNursing =
    capabilities.includes("record_nursing_note") && !isChartLocked;

  const recordedComplaints = complaints.data ?? [];
  const exams = physicalExams.data ?? [];
  const showSubjective =
    canWriteComplaint || canWriteHpi || recordedComplaints.length > 0;

  if (
    !showSubjective &&
    !canWriteExam &&
    !canWriteNote &&
    !canWriteNursing
  ) {
    return null;
  }

  return (
    <div className="divide-y divide-dash-border/70" data-testid="opd-consult-chart">
      {showSubjective ? (
        <SoapBlock mark="S" title="Chief complaint and HPI">
          <div className="space-y-8">
            {recordedComplaints.length === 0 ? (
              <OpdComplaintComposer
                visitUuid={visitUuid}
                encounterUuid={encounterUuid}
                canWriteComplaint={canWriteComplaint}
                canWriteHpi={canWriteHpi}
              />
            ) : (
              recordedComplaints.map((complaint) => (
                <OpdComplaintComposer
                  key={complaint.uuid}
                  visitUuid={visitUuid}
                  encounterUuid={encounterUuid}
                  complaint={complaint}
                  canWriteComplaint={canWriteComplaint}
                  canWriteHpi={canWriteHpi}
                />
              ))
            )}
          </div>
        </SoapBlock>
      ) : null}

      {canWriteExam ? (
        <SoapBlock mark="O" title="Examination">
          <OpdExamComposer
            visitUuid={visitUuid}
            encounterUuid={encounterUuid}
            exams={exams}
            isLoading={physicalExams.isLoading}
          />
        </SoapBlock>
      ) : null}

      {canWriteNote ? (
        <SoapBlock mark="A" title="Assessment and plan">
          <OpdNoteComposer
            kind="clinical"
            visitUuid={visitUuid}
            encounterUuid={encounterUuid}
          />
        </SoapBlock>
      ) : null}

      {canWriteNursing ? (
        <SoapBlock mark="N" title="Nursing note">
          <OpdNoteComposer
            kind="nursing"
            visitUuid={visitUuid}
            encounterUuid={encounterUuid}
          />
        </SoapBlock>
      ) : null}
    </div>
  );
}

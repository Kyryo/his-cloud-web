"use client";

import type { ReactNode } from "react";

import {
  OpdComplaintComposer,
  OpdComplaintHpiField,
} from "@/features/clinical-opd/components/detail/OpdComplaintComposer";
import { OpdExamComposer } from "@/features/clinical-opd/components/detail/OpdExamComposer";
import { OpdNoteComposer } from "@/features/clinical-opd/components/detail/OpdNoteComposer";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import {
  useChiefComplaints,
  useEncounterWorkspace,
} from "@/features/clinical-opd/hooks/use-clinical-opd";

type ConsultSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

function ConsultSection({ title, description, children }: ConsultSectionProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-base font-semibold tracking-tight text-brand-navy">
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 text-sm text-dash-muted">{description}</p>
        ) : null}
      </div>
      {children}
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
    <div className="space-y-8" data-testid="opd-consult-chart">
      {showSubjective ? (
        <ConsultSection
          title="Subjective"
          description="Chief complaint and history for this visit."
        >
          {canWriteComplaint ? (
            <OpdComplaintComposer
              visitUuid={visitUuid}
              encounterUuid={encounterUuid}
              canWriteComplaint={canWriteComplaint}
              canWriteHpi={canWriteHpi}
            />
          ) : null}
          {recordedComplaints.length > 0 ? (
            <div className="space-y-4">
              {recordedComplaints.map((complaint) => (
                <OpdComplaintHpiField
                  key={complaint.uuid}
                  visitUuid={visitUuid}
                  encounterUuid={encounterUuid}
                  complaint={complaint}
                  canWrite={canWriteHpi}
                />
              ))}
            </div>
          ) : null}
        </ConsultSection>
      ) : null}

      {canWriteExam ? (
        <ConsultSection
          title="Examination"
          description="Document findings as you examine the client."
        >
          <OpdExamComposer
            visitUuid={visitUuid}
            encounterUuid={encounterUuid}
            exams={exams}
            isLoading={physicalExams.isLoading}
          />
        </ConsultSection>
      ) : null}

      {canWriteNote ? (
        <ConsultSection
          title="Clinical note"
          description="Assessment, plan, counselling, and follow-up."
        >
          <OpdNoteComposer
            kind="clinical"
            visitUuid={visitUuid}
            encounterUuid={encounterUuid}
          />
        </ConsultSection>
      ) : null}

      {canWriteNursing ? (
        <ConsultSection
          title="Nursing note"
          description="Triage and nursing observations stay on this chart."
        >
          <OpdNoteComposer
            kind="nursing"
            visitUuid={visitUuid}
            encounterUuid={encounterUuid}
          />
        </ConsultSection>
      ) : null}
    </div>
  );
}

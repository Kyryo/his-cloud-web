"use client";

import { useState } from "react";
import { Stethoscope } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  OpdConsultContentPanel,
  OpdConsultFormLocked,
  OpdConsultFormPanel,
  OpdConsultLayout,
} from "@/features/clinical-opd/components/detail/OpdConsultLayout";
import { OpdEditPhysicalExamDialog } from "@/features/clinical-opd/components/detail/OpdEditPhysicalExamDialog";
import { OpdEncounterTabEmptyState } from "@/features/clinical-opd/components/detail/OpdEncounterTabEmptyState";
import { OpdEncounterTabSkeleton } from "@/features/clinical-opd/components/detail/OpdEncounterTabSkeleton";
import {
  OpdPhysicalExamComposer,
  PHYSICAL_EXAM_FORM_ID,
} from "@/features/clinical-opd/components/detail/OpdPhysicalExamComposer";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import {
  useDeletePhysicalExam,
  useEncounterWorkspace,
} from "@/features/clinical-opd/hooks/use-clinical-opd";
import type { EncounterPhysicalExam } from "@/features/clinical-opd/types/clinical-opd.types";
import { richTextToPlainText } from "@/features/clinical-opd/utils/rich-text";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import { cn } from "@/lib/utils";

type OpdPhysicalExaminationTabPanelProps = {
  visitUuid: string;
  encounterUuid: string;
  isActive?: boolean;
};

export function OpdPhysicalExaminationTabPanel({
  visitUuid,
  encounterUuid,
  isActive = true,
}: OpdPhysicalExaminationTabPanelProps) {
  const { isChartLocked, capabilities } = useOpdEncounterWorkspace();
  const { physicalExams } = useEncounterWorkspace(visitUuid, encounterUuid);
  const deletePhysicalExam = useDeletePhysicalExam(visitUuid, encounterUuid);
  const [editingExam, setEditingExam] = useState<EncounterPhysicalExam | null>(
    null,
  );

  const canWrite =
    capabilities.includes("record_physical_exam") && !isChartLocked;

  if (!isActive) {
    return null;
  }

  if (physicalExams.isLoading) {
    return <OpdEncounterTabSkeleton rows={4} />;
  }

  const items = physicalExams.data ?? [];
  const dialogExam =
    editingExam == null
      ? null
      : (items.find((item) => item.uuid === editingExam.uuid) ?? editingExam);

  return (
    <>
      <OpdConsultLayout
        historySection="exam"
        form={
          canWrite ? (
            <OpdConsultFormPanel
              title="Examination"
              action={
                <Button
                  type="submit"
                  form={PHYSICAL_EXAM_FORM_ID}
                  size="sm"
                  className="h-8"
                  data-testid="opd-physical-exam-header-save"
                >
                  Save
                </Button>
              }
            >
              <OpdPhysicalExamComposer
                visitUuid={visitUuid}
                encounterUuid={encounterUuid}
                exam={null}
              />
            </OpdConsultFormPanel>
          ) : (
            <OpdConsultFormPanel title="Examination">
              <OpdConsultFormLocked message="You can review examination findings for this encounter, but you cannot add or edit them." />
            </OpdConsultFormPanel>
          )
        }
        content={
          <OpdConsultContentPanel
            title="Findings"
            count={items.length}
            data-testid="opd-physical-exam-tab-panel"
          >
            {items.length === 0 ? (
              <OpdEncounterTabEmptyState
                icon={Stethoscope}
                title="No examination yet"
                description="Save findings on the left. They will appear here for this visit."
              />
            ) : (
              <ul className="space-y-3">
                {items.map((exam) => (
                  <PhysicalExamRecordCard
                    key={exam.uuid}
                    exam={exam}
                    selected={dialogExam?.uuid === exam.uuid}
                    onSelect={
                      canWrite ? () => setEditingExam(exam) : undefined
                    }
                  />
                ))}
              </ul>
            )}
          </OpdConsultContentPanel>
        }
      />

      {dialogExam ? (
        <OpdEditPhysicalExamDialog
          open
          onOpenChange={(open) => {
            if (!open) {
              setEditingExam(null);
            }
          }}
          visitUuid={visitUuid}
          encounterUuid={encounterUuid}
          exam={dialogExam}
          isDeleting={deletePhysicalExam.isPending}
          onDelete={
            canWrite
              ? async () => {
                  await deletePhysicalExam.mutateAsync(dialogExam.uuid);
                  setEditingExam(null);
                }
              : undefined
          }
        />
      ) : null}
    </>
  );
}

function PhysicalExamRecordCard({
  exam,
  selected,
  onSelect,
}: {
  exam: EncounterPhysicalExam;
  selected: boolean;
  onSelect?: () => void;
}) {
  const findings = richTextToPlainText(exam.findings);
  const recordedMeta = [
    formatDisplayDateTime(exam.recorded_at),
    exam.recorded_by_name,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <li>
      <article
        className={cn(
          "rounded-lg border bg-white px-4 py-3",
          selected ? "border-brand-primary" : "border-dash-border/80",
          onSelect &&
            "cursor-pointer transition-colors hover:border-brand-primary/50",
        )}
        data-testid={`opd-physical-exam-item-${exam.uuid}`}
      >
        {onSelect ? (
          <button type="button" className="w-full text-left" onClick={onSelect}>
            <PhysicalExamRecordBody
              findings={findings}
              recordedMeta={recordedMeta}
            />
          </button>
        ) : (
          <PhysicalExamRecordBody
            findings={findings}
            recordedMeta={recordedMeta}
          />
        )}
      </article>
    </li>
  );
}

function PhysicalExamRecordBody({
  findings,
  recordedMeta,
}: {
  findings: string;
  recordedMeta: string;
}) {
  return (
    <div className="space-y-2">
      {findings ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-brand-slate">
          {findings}
        </p>
      ) : (
        <p className="text-sm text-dash-muted">No findings recorded</p>
      )}
      {recordedMeta ? (
        <p className="text-xs text-dash-muted">{recordedMeta}</p>
      ) : null}
    </div>
  );
}

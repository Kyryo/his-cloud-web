"use client";

import { FileText } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  OpdConsultContentPanel,
  OpdConsultFormLocked,
  OpdConsultFormPanel,
  OpdConsultLayout,
} from "@/features/clinical-opd/components/detail/OpdConsultLayout";
import {
  OpdEncounterRecordList,
  OpdEncounterRecordListItem,
} from "@/features/clinical-opd/components/detail/OpdEncounterRecordList";
import { OpdEncounterTabEmptyState } from "@/features/clinical-opd/components/detail/OpdEncounterTabEmptyState";
import { OpdEncounterTabSkeleton } from "@/features/clinical-opd/components/detail/OpdEncounterTabSkeleton";
import {
  OpdNoteComposer,
  type OpdNoteAmendTarget,
} from "@/features/clinical-opd/components/detail/OpdNoteComposer";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import { useEncounterWorkspace } from "@/features/clinical-opd/hooks/use-clinical-opd";
import type { ClinicalWorkspacePanelProps } from "@/features/clinical-workspace/types/clinical-workspace.types";

export const DENTAL_NOTE_FORM_ID = "dental-clinical-note-form";

export function DentalNotesTabPanel({
  visitUuid,
  encounterUuid,
  isActive = true,
}: ClinicalWorkspacePanelProps) {
  const { isChartLocked, capabilities } = useOpdEncounterWorkspace();
  const { clinicalNotes } = useEncounterWorkspace(visitUuid, encounterUuid);
  const [amendTarget, setAmendTarget] = useState<OpdNoteAmendTarget | null>(
    null,
  );

  const canWrite = capabilities.includes("record_clinical_note");
  const canCreate = canWrite && !isChartLocked;
  const canAmend = canWrite && isChartLocked;
  const showComposer = canCreate || Boolean(amendTarget);

  if (!isActive) {
    return null;
  }

  if (clinicalNotes.isLoading) {
    return <OpdEncounterTabSkeleton rows={4} />;
  }

  const items = clinicalNotes.data ?? [];

  const content =
    items.length === 0 ? (
      <OpdEncounterTabEmptyState
        icon={FileText}
        title="No clinical notes"
        description="Notes you save on the left will show up here for this visit."
        data-testid="dental-notes-empty-state"
      />
    ) : (
      <OpdEncounterRecordList
        title="This visit"
        data-testid="dental-notes-list"
      >
        {items.map((note) => (
          <OpdEncounterRecordListItem
            key={note.uuid}
            compact
            icon={FileText}
            title={note.amendment_of_uuid ? "Amended note" : "Clinical note"}
            description={
              <p className="line-clamp-4 whitespace-pre-wrap">{note.body}</p>
            }
            dateTime={note.recorded_at}
            createdByName={note.recorded_by_name}
            menuActions={
              canAmend && !note.amendment_of_uuid
                ? [
                    {
                      label: "Amend",
                      onClick: () => {
                        setAmendTarget({ uuid: note.uuid, body: note.body });
                      },
                    },
                  ]
                : undefined
            }
          />
        ))}
      </OpdEncounterRecordList>
    );

  const formTitle = amendTarget ? "Amend note" : "Add note";

  return (
    <OpdConsultLayout
      historySection="notes"
      data-testid="dental-notes-layout"
      form={
        showComposer ? (
          <OpdConsultFormPanel
            title={formTitle}
            description={
              amendTarget
                ? "Update the note and explain why it is being amended."
                : "Document chair-side findings, clinical impressions, and follow-up."
            }
            action={
              <Button
                type="submit"
                form={DENTAL_NOTE_FORM_ID}
                size="sm"
                className="h-8"
                data-testid="dental-notes-header-save"
              >
                Save
              </Button>
            }
          >
            <OpdNoteComposer
              key={amendTarget?.uuid ?? "create"}
              kind="clinical"
              visitUuid={visitUuid}
              encounterUuid={encounterUuid}
              amendTarget={amendTarget}
              onAmendCleared={() => setAmendTarget(null)}
              formId={DENTAL_NOTE_FORM_ID}
              showSubmitButton={false}
            />
          </OpdConsultFormPanel>
        ) : (
          <OpdConsultFormPanel title="Clinical notes">
            <OpdConsultFormLocked
              message={
                canWrite
                  ? "This encounter is locked. You can still amend existing notes from This visit."
                  : "You can review notes for this encounter, but you cannot add or amend them."
              }
            />
          </OpdConsultFormPanel>
        )
      }
      content={
        <OpdConsultContentPanel title="This visit" count={items.length}>
          {content}
        </OpdConsultContentPanel>
      }
    />
  );
}

"use client";

import { NotebookPen } from "lucide-react";
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

export const NURSING_NOTE_FORM_ID = "opd-nursing-note-form";

const NURSING_HISTORY_SECTIONS = ["nursing"] as const;

type OpdNursingTabPanelProps = {
  visitUuid: string;
  encounterUuid: string;
  isActive?: boolean;
};

export function OpdNursingTabPanel({
  visitUuid,
  encounterUuid,
  isActive = true,
}: OpdNursingTabPanelProps) {
  const { isChartLocked, capabilities } = useOpdEncounterWorkspace();
  const { nursingNotes } = useEncounterWorkspace(visitUuid, encounterUuid);
  const [amendTarget, setAmendTarget] = useState<OpdNoteAmendTarget | null>(
    null,
  );

  const canWrite = capabilities.includes("record_nursing_note");
  const canCreate = canWrite && !isChartLocked;
  const canAmend = canWrite && isChartLocked;
  const showComposer = canCreate || Boolean(amendTarget);

  if (!isActive) {
    return null;
  }

  if (nursingNotes.isLoading) {
    return <OpdEncounterTabSkeleton rows={4} />;
  }

  const items = nursingNotes.data ?? [];

  const content =
    items.length === 0 ? (
      <OpdEncounterTabEmptyState
        icon={NotebookPen}
        title="No nursing notes"
        description="Notes you save on the left will show up here for this visit."
        data-testid="opd-nursing-empty-state"
      />
    ) : (
      <OpdEncounterRecordList
        title="This visit"
        data-testid="opd-nursing-notes-list"
      >
        {items.map((note) => (
          <OpdEncounterRecordListItem
            key={note.uuid}
            compact
            icon={NotebookPen}
            title={note.amendment_of_uuid ? "Amended note" : "Nursing note"}
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
      historySection="nursing"
      historyAllowedSections={NURSING_HISTORY_SECTIONS}
      data-testid="opd-nursing-layout"
      form={
        showComposer ? (
          <OpdConsultFormPanel
            title={formTitle}
            description={
              amendTarget
                ? "Update the note and explain why it is being amended."
                : "Document triage findings, observations, and care given."
            }
            action={
              <Button
                type="submit"
                form={NURSING_NOTE_FORM_ID}
                size="sm"
                className="h-8"
                data-testid="opd-nursing-header-save"
              >
                Save
              </Button>
            }
          >
            <OpdNoteComposer
              key={amendTarget?.uuid ?? "create"}
              kind="nursing"
              visitUuid={visitUuid}
              encounterUuid={encounterUuid}
              amendTarget={amendTarget}
              onAmendCleared={() => setAmendTarget(null)}
              formId={NURSING_NOTE_FORM_ID}
              showSubmitButton={false}
            />
          </OpdConsultFormPanel>
        ) : (
          <OpdConsultFormPanel title="Nurse's notes">
            <OpdConsultFormLocked
              message={
                canWrite
                  ? "This encounter is locked. You can still amend existing notes from This visit."
                  : "You can review nursing notes for this encounter, but you cannot add or amend them."
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

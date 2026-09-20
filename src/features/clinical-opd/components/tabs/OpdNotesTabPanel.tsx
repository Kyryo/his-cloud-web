"use client";

import { FileText } from "lucide-react";
import { useState } from "react";

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

type OpdNotesTabPanelProps = {
  visitUuid: string;
  encounterUuid: string;
  isActive?: boolean;
};

export function OpdNotesTabPanel({
  visitUuid,
  encounterUuid,
  isActive = true,
}: OpdNotesTabPanelProps) {
  const { isChartLocked, capabilities } = useOpdEncounterWorkspace();
  const { clinicalNotes } = useEncounterWorkspace(visitUuid, encounterUuid);
  const [amendTarget, setAmendTarget] = useState<OpdNoteAmendTarget | null>(
    null,
  );
  const canWrite = capabilities.includes("record_clinical_note");
  const canCreate = canWrite && !isChartLocked;
  const canAmend = canWrite && isChartLocked;

  if (!isActive) return null;
  if (clinicalNotes.isLoading) return <OpdEncounterTabSkeleton rows={4} />;

  const items = clinicalNotes.data ?? [];

  return (
    <div className="space-y-6" data-testid="opd-notes-tab-panel">
      {canCreate || amendTarget ? (
        <OpdNoteComposer
          key={amendTarget?.uuid ?? "create"}
          kind="clinical"
          visitUuid={visitUuid}
          encounterUuid={encounterUuid}
          amendTarget={amendTarget}
          onAmendCleared={() => setAmendTarget(null)}
        />
      ) : null}

      {items.length === 0 ? (
        canCreate ? null : (
          <OpdEncounterTabEmptyState
            icon={FileText}
            title="No clinical notes"
            description="Creating a note signs it. Amend only after the encounter is completed."
          />
        )
      ) : (
        <OpdEncounterRecordList title="Clinical notes">
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
      )}
    </div>
  );
}

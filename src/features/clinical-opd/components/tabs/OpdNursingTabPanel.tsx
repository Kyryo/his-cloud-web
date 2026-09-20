"use client";

import { NotebookPen } from "lucide-react";
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

  if (!isActive) {
    return null;
  }

  if (nursingNotes.isLoading) {
    return <OpdEncounterTabSkeleton rows={4} />;
  }

  const items = nursingNotes.data ?? [];

  return (
    <div className="space-y-6" data-testid="opd-nursing-tab-panel">
      {canCreate || amendTarget ? (
        <OpdNoteComposer
          key={amendTarget?.uuid ?? "create"}
          kind="nursing"
          visitUuid={visitUuid}
          encounterUuid={encounterUuid}
          amendTarget={amendTarget}
          onAmendCleared={() => setAmendTarget(null)}
        />
      ) : null}

      {items.length === 0 ? (
        canCreate ? null : (
          <OpdEncounterTabEmptyState
            icon={NotebookPen}
            title="No nursing notes"
            description="Triage notes stay on the queue as waiting until the doctor starts the consult."
          />
        )
      ) : (
        <OpdEncounterRecordList title="Nursing notes">
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
      )}
    </div>
  );
}

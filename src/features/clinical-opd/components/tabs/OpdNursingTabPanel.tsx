"use client";

import { useState } from "react";
import { NotebookPen } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { TabAddActionButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  OpdEncounterRecordList,
  OpdEncounterRecordListItem,
} from "@/features/clinical-opd/components/detail/OpdEncounterRecordList";
import { OpdEncounterTabEmptyState } from "@/features/clinical-opd/components/detail/OpdEncounterTabEmptyState";
import { OpdEncounterTabSkeleton } from "@/features/clinical-opd/components/detail/OpdEncounterTabSkeleton";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import {
  useAmendNursingNote,
  useCreateNursingNote,
  useEncounterWorkspace,
} from "@/features/clinical-opd/hooks/use-clinical-opd";
import { nursingNoteSchema } from "@/features/clinical-opd/schemas/clinical-opd.schema";

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
  const createNursingNote = useCreateNursingNote(visitUuid, encounterUuid);
  const amendNursingNote = useAmendNursingNote(visitUuid, encounterUuid);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [amendNoteUuid, setAmendNoteUuid] = useState<string | null>(null);
  const canWrite = capabilities.includes("record_nursing_note");

  const form = useForm({
    resolver: zodResolver(nursingNoteSchema),
    defaultValues: { body: "", amendment_reason: "" },
  });

  if (!isActive) {
    return null;
  }

  if (nursingNotes.isLoading) {
    return <OpdEncounterTabSkeleton rows={4} />;
  }

  const items = nursingNotes.data ?? [];
  const addAction =
    canWrite && !isChartLocked ? (
      <TabAddActionButton
        type="button"
        onClick={() => {
          setAmendNoteUuid(null);
          form.reset({ body: "", amendment_reason: "" });
          setDialogOpen(true);
        }}
      >
        Add note
      </TabAddActionButton>
    ) : null;

  return (
    <div className="space-y-4" data-testid="opd-nursing-tab-panel">
      {items.length === 0 ? (
        <OpdEncounterTabEmptyState
          icon={NotebookPen}
          title="No nursing notes"
          description="Triage notes stay on the queue as waiting until the doctor starts the consult."
          action={addAction}
        />
      ) : (
        <OpdEncounterRecordList title="Nursing notes" action={addAction}>
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
                canWrite && isChartLocked && !note.amendment_of_uuid
                  ? [
                      {
                        label: "Amend",
                        onClick: () => {
                          setAmendNoteUuid(note.uuid);
                          form.reset({
                            body: note.body,
                            amendment_reason: "",
                          });
                          setDialogOpen(true);
                        },
                      },
                    ]
                  : undefined
              }
            />
          ))}
        </OpdEncounterRecordList>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {amendNoteUuid ? "Amend nursing note" : "Add nursing note"}
            </DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
              if (amendNoteUuid) {
                await amendNursingNote.mutateAsync({
                  noteUuid: amendNoteUuid,
                  payload: {
                    body: values.body,
                    amendment_reason: values.amendment_reason,
                  },
                });
              } else {
                await createNursingNote.mutateAsync({ body: values.body });
              }
              form.reset();
              setDialogOpen(false);
            })}
          >
            <div className="space-y-2">
              <Label htmlFor="nursing-note">
                Note <RequiredFieldMarker />
              </Label>
              <Textarea id="nursing-note" rows={4} {...form.register("body")} />
            </div>
            {amendNoteUuid ? (
              <div className="space-y-2">
                <Label htmlFor="nursing-amend-reason">
                  Amendment reason <RequiredFieldMarker />
                </Label>
                <Textarea
                  id="nursing-amend-reason"
                  rows={2}
                  {...form.register("amendment_reason")}
                />
              </div>
            ) : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  createNursingNote.isPending || amendNursingNote.isPending
                }
              >
                {amendNoteUuid ? "Save amendment" : "Save note"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

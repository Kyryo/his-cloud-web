"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
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
  useAmendClinicalNote,
  useCreateClinicalNote,
  useEncounterWorkspace,
} from "@/features/clinical-opd/hooks/use-clinical-opd";
import { clinicalNoteSchema } from "@/features/clinical-opd/schemas/clinical-opd.schema";

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
  const createNote = useCreateClinicalNote(visitUuid, encounterUuid);
  const amendNote = useAmendClinicalNote(visitUuid, encounterUuid);
  const [open, setOpen] = useState(false);
  const [amendUuid, setAmendUuid] = useState<string | null>(null);
  const canWrite = capabilities.includes("record_clinical_note");
  const form = useForm({
    resolver: zodResolver(clinicalNoteSchema),
    defaultValues: { body: "", amendment_reason: "" },
  });

  if (!isActive) return null;
  if (clinicalNotes.isLoading) return <OpdEncounterTabSkeleton rows={4} />;

  const items = clinicalNotes.data ?? [];

  return (
    <div data-testid="opd-notes-tab-panel">
      {items.length === 0 ? (
        <OpdEncounterTabEmptyState
          icon={FileText}
          title="No clinical notes"
          description="Creating a note signs it. Amend only after the encounter is completed."
          action={
            canWrite && !isChartLocked ? (
              <TabAddActionButton
                label="Add note"
                emptyState
                onClick={() => {
                  setAmendUuid(null);
                  form.reset({ body: "", amendment_reason: "" });
                  setOpen(true);
                }}
              />
            ) : null
          }
        />
      ) : (
        <OpdEncounterRecordList
          title="Clinical notes"
          action={
            canWrite && !isChartLocked ? (
              <TabAddActionButton
                label="Add note"
                onClick={() => {
                  setAmendUuid(null);
                  form.reset({ body: "", amendment_reason: "" });
                  setOpen(true);
                }}
              />
            ) : null
          }
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
                canWrite && isChartLocked && !note.amendment_of_uuid
                  ? [
                      {
                        label: "Amend",
                        onClick: () => {
                          setAmendUuid(note.uuid);
                          form.reset({
                            body: note.body,
                            amendment_reason: "",
                          });
                          setOpen(true);
                        },
                      },
                    ]
                  : undefined
              }
            />
          ))}
        </OpdEncounterRecordList>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {amendUuid ? "Amend clinical note" : "Add clinical note"}
            </DialogTitle>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={form.handleSubmit(async (values) => {
              if (amendUuid) {
                await amendNote.mutateAsync({
                  noteUuid: amendUuid,
                  payload: {
                    body: values.body,
                    amendment_reason: values.amendment_reason ?? "",
                  },
                });
              } else {
                await createNote.mutateAsync({ body: values.body });
              }
              form.reset();
              setOpen(false);
            })}
          >
            <div className="space-y-1.5">
              <Label>
                Note <RequiredFieldMarker />
              </Label>
              <Textarea rows={5} {...form.register("body")} />
            </div>
            {amendUuid ? (
              <div className="space-y-1.5">
                <Label>
                  Amendment reason <RequiredFieldMarker />
                </Label>
                <Textarea rows={2} {...form.register("amendment_reason")} />
              </div>
            ) : null}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createNote.isPending || amendNote.isPending}
              >
                {amendUuid ? "Save amendment" : "Save note"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

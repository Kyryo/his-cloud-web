"use client";

import { useState } from "react";
import { Activity, NotebookPen } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { TabAddActionButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  useCreateNursingNote,
  useCreateObservation,
  useEncounterWorkspace,
  useObservationDefinitions,
} from "@/features/clinical-opd/hooks/use-clinical-opd";
import { nursingNoteSchema } from "@/features/clinical-opd/schemas/clinical-opd.schema";

type OpdVitalSignsTabPanelProps = {
  visitUuid: string;
  encounterUuid: string;
  isActive?: boolean;
};

export function OpdVitalSignsTabPanel({
  visitUuid,
  encounterUuid,
  isActive = true,
}: OpdVitalSignsTabPanelProps) {
  const { observations, nursingNotes } = useEncounterWorkspace(
    visitUuid,
    encounterUuid,
  );
  const definitions = useObservationDefinitions();
  const createObservation = useCreateObservation(visitUuid, encounterUuid);
  const createNursingNote = useCreateNursingNote(visitUuid, encounterUuid);
  const [vitalDialogOpen, setVitalDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedDefinition, setSelectedDefinition] = useState("");
  const [vitalValue, setVitalValue] = useState("");

  const form = useForm({
    resolver: zodResolver(nursingNoteSchema),
    defaultValues: { body: "" },
  });

  if (!isActive) {
    return null;
  }

  const isLoading =
    observations.isLoading || nursingNotes.isLoading || definitions.isLoading;

  if (isLoading) {
    return <OpdEncounterTabSkeleton className="pt-4" rows={4} />;
  }

  async function handleSaveVital() {
    if (!selectedDefinition || !vitalValue.trim()) return;
    const definition = definitions.data?.find(
      (item) => item.uuid === selectedDefinition,
    );
    if (!definition) return;
    await createObservation.mutateAsync({
      definition_uuid: selectedDefinition,
      numeric_value: definition.value_type !== "text" ? vitalValue : undefined,
      text_value: definition.value_type === "text" ? vitalValue : "",
      unit: definition.default_unit,
    });
    setVitalValue("");
    setSelectedDefinition("");
    setVitalDialogOpen(false);
  }

  const vitalItems = observations.data ?? [];
  const noteItems = nursingNotes.data ?? [];
  const hasRecords = vitalItems.length > 0 || noteItems.length > 0;

  const recordVitalButton = (
    <TabAddActionButton
      label="Record vital"
      onClick={() => setVitalDialogOpen(true)}
      data-testid="opd-record-vital-button"
    />
  );

  const addNoteButton = (
    <TabAddActionButton
      label="Add note"
      onClick={() => setNoteDialogOpen(true)}
      data-testid="opd-add-nursing-note-button"
    />
  );

  if (!hasRecords) {
    return (
      <div className="pt-4">
        <OpdEncounterTabEmptyState
          icon={Activity}
          title="No vital signs recorded"
          description="Record vitals and nursing notes for this encounter as they are taken."
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <TabAddActionButton
                label="Record vital"
                emptyState
                onClick={() => setVitalDialogOpen(true)}
              />
              <TabAddActionButton
                label="Add nursing note"
                emptyState
                onClick={() => setNoteDialogOpen(true)}
              />
            </div>
          }
          data-testid="opd-vital-signs-empty-state"
        />

        <VitalDialog
          open={vitalDialogOpen}
          onOpenChange={setVitalDialogOpen}
          definitions={definitions.data ?? []}
          selectedDefinition={selectedDefinition}
          vitalValue={vitalValue}
          isSaving={createObservation.isPending}
          onDefinitionChange={setSelectedDefinition}
          onValueChange={setVitalValue}
          onSave={() => void handleSaveVital()}
        />
        <NursingNoteDialog
          open={noteDialogOpen}
          onOpenChange={setNoteDialogOpen}
          form={form}
          isSaving={createNursingNote.isPending}
          onSave={form.handleSubmit(async (values) => {
            await createNursingNote.mutateAsync(values);
            form.reset();
            setNoteDialogOpen(false);
          })}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-4">
      <OpdEncounterRecordList
        title={
          <span className="inline-flex items-center gap-1.5">
            <Activity className="size-4 text-brand-primary" aria-hidden="true" />
            <span>Vital signs</span>
          </span>
        }
        description="Recorded observations for this encounter."
        action={recordVitalButton}
        data-testid="opd-vital-signs-list"
      >
        {vitalItems.length === 0 ? (
          <li className="px-4 py-6 text-sm text-brand-muted sm:px-5">
            No vital signs recorded yet.
          </li>
        ) : (
          vitalItems.map((observation) => (
            <OpdEncounterRecordListItem
              key={observation.uuid}
              compact
              icon={Activity}
              title={observation.definition_name}
              description={`${observation.numeric_value ?? observation.text_value} ${observation.unit}`.trim()}
              dateTime={observation.recorded_at}
              createdByName={observation.recorded_by_name}
            />
          ))
        )}
      </OpdEncounterRecordList>

      <OpdEncounterRecordList
        title={
          <span className="inline-flex items-center gap-1.5">
            <NotebookPen className="size-4 text-brand-primary" aria-hidden="true" />
            <span>Nursing notes</span>
          </span>
        }
        description="Nursing documentation for this encounter."
        action={addNoteButton}
        data-testid="opd-nursing-notes-list"
      >
        {noteItems.length === 0 ? (
          <li className="px-4 py-6 text-sm text-brand-muted sm:px-5">
            No nursing notes recorded yet.
          </li>
        ) : (
          noteItems.map((note) => (
            <OpdEncounterRecordListItem
              key={note.uuid}
              compact
              icon={NotebookPen}
              title="Nursing note"
              description={
                <p className="line-clamp-3 whitespace-pre-wrap">{note.body}</p>
              }
              dateTime={note.recorded_at}
              createdByName={note.recorded_by_name}
            />
          ))
        )}
      </OpdEncounterRecordList>

      <VitalDialog
        open={vitalDialogOpen}
        onOpenChange={setVitalDialogOpen}
        definitions={definitions.data ?? []}
        selectedDefinition={selectedDefinition}
        vitalValue={vitalValue}
        isSaving={createObservation.isPending}
        onDefinitionChange={setSelectedDefinition}
        onValueChange={setVitalValue}
        onSave={() => void handleSaveVital()}
      />
      <NursingNoteDialog
        open={noteDialogOpen}
        onOpenChange={setNoteDialogOpen}
        form={form}
        isSaving={createNursingNote.isPending}
        onSave={form.handleSubmit(async (values) => {
          await createNursingNote.mutateAsync(values);
          form.reset();
          setNoteDialogOpen(false);
        })}
      />
    </div>
  );
}

type VitalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  definitions: Array<{ uuid: string; name: string; value_type: string; default_unit: string }>;
  selectedDefinition: string;
  vitalValue: string;
  isSaving: boolean;
  onDefinitionChange: (value: string) => void;
  onValueChange: (value: string) => void;
  onSave: () => void;
};

function VitalDialog({
  open,
  onOpenChange,
  definitions,
  selectedDefinition,
  vitalValue,
  isSaving,
  onDefinitionChange,
  onValueChange,
  onSave,
}: VitalDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record vital sign</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Vital</Label>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={selectedDefinition}
              onChange={(event) => onDefinitionChange(event.target.value)}
            >
              <option value="">Select vital</option>
              {definitions.map((definition) => (
                <option key={definition.uuid} value={definition.uuid}>
                  {definition.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>
              Value <RequiredFieldMarker />
            </Label>
            <Input
              value={vitalValue}
              onChange={(event) => onValueChange(event.target.value)}
              inputMode="decimal"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" disabled={isSaving} onClick={onSave}>
            {isSaving ? "Saving..." : "Save vital"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type NursingNoteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: ReturnType<typeof useForm<{ body: string }>>;
  isSaving: boolean;
  onSave: () => void;
};

function NursingNoteDialog({
  open,
  onOpenChange,
  form,
  isSaving,
  onSave,
}: NursingNoteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add nursing note</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSave}>
          <div className="space-y-2">
            <Label htmlFor="nursing-note">
              Note <RequiredFieldMarker />
            </Label>
            <Textarea id="nursing-note" rows={4} {...form.register("body")} />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

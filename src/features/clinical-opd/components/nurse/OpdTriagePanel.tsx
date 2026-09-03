"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import {
  useCreateNursingNote,
  useCreateObservation,
  useEncounterWorkspace,
  useObservationDefinitions,
} from "@/features/clinical-opd/hooks/use-clinical-opd";
import { nursingNoteSchema } from "@/features/clinical-opd/schemas/clinical-opd.schema";
import { OpdClinicalTimeline } from "@/features/clinical-opd/components/shared/OpdClinicalTimeline";
import { appFont } from "@/lib/fonts";

type OpdTriagePanelProps = {
  visitUuid: string;
  encounterUuid: string;
};

export function OpdTriagePanel({
  visitUuid,
  encounterUuid,
}: OpdTriagePanelProps) {
  const { observations, nursingNotes, timeline } = useEncounterWorkspace(
    visitUuid,
    encounterUuid,
  );
  const definitions = useObservationDefinitions();
  const createObservation = useCreateObservation(visitUuid, encounterUuid);
  const createNursingNote = useCreateNursingNote(visitUuid, encounterUuid);
  const [selectedDefinition, setSelectedDefinition] = useState("");
  const [vitalValue, setVitalValue] = useState("");

  const form = useForm({
    resolver: zodResolver(nursingNoteSchema),
    defaultValues: { body: "" },
  });

  async function handleSaveVital() {
    if (!selectedDefinition || !vitalValue.trim()) return;
    const definition = definitions.data?.find((item) => item.uuid === selectedDefinition);
    if (!definition) return;
    await createObservation.mutateAsync({
      definition_uuid: selectedDefinition,
      numeric_value: definition.value_type !== "text" ? vitalValue : undefined,
      text_value: definition.value_type === "text" ? vitalValue : "",
      unit: definition.default_unit,
    });
    setVitalValue("");
  }

  return (
    <div className={`space-y-6 ${appFont.className}`}>
      <section className="rounded-xl border border-dash-border/80 bg-white p-4">
        <h2 className="text-base font-semibold text-brand-navy">Vitals</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Vital</Label>
            <select
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={selectedDefinition}
              onChange={(event) => setSelectedDefinition(event.target.value)}
            >
              <option value="">Select vital</option>
              {(definitions.data ?? []).map((definition) => (
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
              onChange={(event) => setVitalValue(event.target.value)}
              inputMode="decimal"
            />
          </div>
          <div className="flex items-end">
            <Button type="button" onClick={() => void handleSaveVital()}>
              Record vital
            </Button>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {(observations.data ?? []).map((observation) => (
            <div
              key={observation.uuid}
              className="flex items-center justify-between rounded-md border border-dash-border/60 px-3 py-2 text-sm"
            >
              <span className="font-medium">{observation.definition_name}</span>
              <span>
                {observation.numeric_value ?? observation.text_value}{" "}
                {observation.unit}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-dash-border/80 bg-white p-4">
        <h2 className="text-base font-semibold text-brand-navy">Nursing notes</h2>
        <form
          className="mt-4 space-y-3"
          onSubmit={form.handleSubmit(async (values) => {
            await createNursingNote.mutateAsync(values);
            form.reset();
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="nursing-note">
              Note <RequiredFieldMarker />
            </Label>
            <Textarea id="nursing-note" rows={4} {...form.register("body")} />
          </div>
          <Button type="submit">Save nursing note</Button>
        </form>
        <div className="mt-4 space-y-2">
          {(nursingNotes.data ?? []).map((note) => (
            <div
              key={note.uuid}
              className="rounded-md border border-dash-border/60 px-3 py-2 text-sm"
            >
              <p>{note.body}</p>
              <p className="mt-1 text-xs text-brand-muted">
                {new Date(note.recorded_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-dash-border/80 bg-white p-4">
        <h2 className="text-base font-semibold text-brand-navy">Timeline</h2>
        <div className="mt-4">
          <OpdClinicalTimeline events={timeline.data ?? []} />
        </div>
      </section>
    </div>
  );
}

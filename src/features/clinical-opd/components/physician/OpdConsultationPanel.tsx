"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import { EncounterDiagnosisPanel } from "@/features/clinical/components/EncounterDiagnosisPanel";
import {
  useCreateClinicalNote,
  useCreatePhysicalExam,
  useEncounterWorkspace,
} from "@/features/clinical-opd/hooks/use-clinical-opd";
import {
  clinicalNoteSchema,
  physicalExamSchema,
} from "@/features/clinical-opd/schemas/clinical-opd.schema";
import { OpdClinicalTimeline } from "@/features/clinical-opd/components/shared/OpdClinicalTimeline";
import { appFont } from "@/lib/fonts";

type OpdConsultationPanelProps = {
  visitUuid: string;
  encounterUuid: string;
};

export function OpdConsultationPanel({
  visitUuid,
  encounterUuid,
}: OpdConsultationPanelProps) {
  const { physicalExams, clinicalNotes, timeline, nursingNotes, observations } =
    useEncounterWorkspace(visitUuid, encounterUuid);
  const createPhysicalExam = useCreatePhysicalExam(visitUuid, encounterUuid);
  const createClinicalNote = useCreateClinicalNote(visitUuid, encounterUuid);

  const examForm = useForm({
    resolver: zodResolver(physicalExamSchema),
    defaultValues: { section: "general", findings: "", system_code: "" },
  });

  const noteForm = useForm({
    resolver: zodResolver(clinicalNoteSchema),
    defaultValues: { body: "" },
  });

  return (
    <div className={`space-y-6 ${appFont.className}`}>
      <section className="rounded-xl border border-dash-border/80 bg-white p-4">
        <h2 className="text-base font-semibold text-brand-navy">Triage review</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-brand-navy">Vitals</h3>
            <div className="mt-2 space-y-1 text-sm text-brand-slate">
              {(observations.data ?? []).map((item) => (
                <p key={item.uuid}>
                  {item.definition_name}: {item.numeric_value ?? item.text_value}{" "}
                  {item.unit}
                </p>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-brand-navy">Nursing notes</h3>
            <div className="mt-2 space-y-1 text-sm text-brand-slate">
              {(nursingNotes.data ?? []).map((item) => (
                <p key={item.uuid}>{item.body}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-dash-border/80 bg-white p-4">
        <h2 className="text-base font-semibold text-brand-navy">Physical exam</h2>
        <form
          className="mt-4 space-y-3"
          onSubmit={examForm.handleSubmit(async (values) => {
            await createPhysicalExam.mutateAsync(values);
            examForm.reset({ section: "general", findings: "", system_code: "" });
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="findings">
              Findings <RequiredFieldMarker />
            </Label>
            <Textarea id="findings" rows={4} {...examForm.register("findings")} />
          </div>
          <Button type="submit">Save physical exam</Button>
        </form>
        <div className="mt-4 space-y-2">
          {(physicalExams.data ?? []).map((exam) => (
            <div
              key={exam.uuid}
              className="rounded-md border border-dash-border/60 px-3 py-2 text-sm"
            >
              <p className="font-medium capitalize">{exam.section}</p>
              <p className="mt-1">{exam.findings}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-dash-border/80 bg-white p-4">
        <EncounterDiagnosisPanel visitUuid={visitUuid} encounterUuid={encounterUuid} />
      </section>

      <section className="rounded-xl border border-dash-border/80 bg-white p-4">
        <h2 className="text-base font-semibold text-brand-navy">Clinical notes</h2>
        <form
          className="mt-4 space-y-3"
          onSubmit={noteForm.handleSubmit(async (values) => {
            await createClinicalNote.mutateAsync(values);
            noteForm.reset();
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="clinical-note">
              Note <RequiredFieldMarker />
            </Label>
            <Textarea id="clinical-note" rows={4} {...noteForm.register("body")} />
          </div>
          <Button type="submit">Save clinical note</Button>
        </form>
        <div className="mt-4 space-y-2">
          {(clinicalNotes.data ?? []).map((note) => (
            <div
              key={note.uuid}
              className="rounded-md border border-dash-border/60 px-3 py-2 text-sm"
            >
              <p>{note.body}</p>
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

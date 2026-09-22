"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Label } from "@/components/ui/label";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import { Textarea } from "@/components/ui/textarea";
import { OpdInlineComposer } from "@/features/clinical-opd/components/detail/OpdInlineComposer";
import {
  useAmendClinicalNote,
  useAmendNursingNote,
  useCreateClinicalNote,
  useCreateNursingNote,
} from "@/features/clinical-opd/hooks/use-clinical-opd";
import {
  clinicalNoteAmendSchema,
  clinicalNoteSchema,
  nursingNoteSchema,
} from "@/features/clinical-opd/schemas/clinical-opd.schema";

export type OpdNoteAmendTarget = {
  uuid: string;
  body: string;
};

const nursingNoteAmendSchema = nursingNoteSchema.extend({
  amendment_reason: z.string().trim().min(1, "Amendment reason is required."),
});

type OpdNoteComposerProps = {
  kind: "clinical" | "nursing";
  visitUuid: string;
  encounterUuid: string;
  disabled?: boolean;
  amendTarget?: OpdNoteAmendTarget | null;
  onAmendCleared?: () => void;
};

export function OpdNoteComposer({
  kind,
  visitUuid,
  encounterUuid,
  disabled = false,
  amendTarget = null,
  onAmendCleared,
}: OpdNoteComposerProps) {
  const isNursing = kind === "nursing";
  const isAmending = Boolean(amendTarget);
  const createClinicalNote = useCreateClinicalNote(visitUuid, encounterUuid);
  const amendClinicalNote = useAmendClinicalNote(visitUuid, encounterUuid);
  const createNursingNote = useCreateNursingNote(visitUuid, encounterUuid);
  const amendNursingNote = useAmendNursingNote(visitUuid, encounterUuid);
  const schema = isAmending
    ? isNursing
      ? nursingNoteAmendSchema
      : clinicalNoteAmendSchema
    : isNursing
      ? nursingNoteSchema
      : clinicalNoteSchema;
  const form = useForm<{ body: string; amendment_reason?: string }>({
    resolver: zodResolver(schema),
    defaultValues: {
      body: amendTarget?.body ?? "",
      amendment_reason: "",
    },
  });

  const isPending = isNursing
    ? createNursingNote.isPending || amendNursingNote.isPending
    : createClinicalNote.isPending || amendClinicalNote.isPending;
  const fieldId = isNursing ? "opd-nursing-note" : "opd-clinical-note";
  const reasonId = `${fieldId}-amend-reason`;

  return (
    <OpdInlineComposer
      id={fieldId}
      title={
        isAmending
          ? isNursing
            ? "Amend nursing note"
            : "Amend clinical note"
          : undefined
      }
      label="Note"
      placeholder={
        isNursing
          ? "Triage findings, nursing observations, and care given"
          : "Assessment, plan, counselling, and follow-up"
      }
      rows={5}
      error={form.formState.errors.body?.message}
      submitLabel={isAmending ? "Save amendment" : "Save note"}
      isPending={isPending}
      disabled={disabled}
      data-testid={
        isNursing ? "opd-nursing-note-composer" : "opd-clinical-note-composer"
      }
      textareaProps={form.register("body")}
      extra={
        isAmending ? (
          <div className="space-y-1.5">
            <Label htmlFor={reasonId}>
              Amendment reason <RequiredFieldMarker />
            </Label>
            <Textarea
              id={reasonId}
              rows={2}
              {...form.register("amendment_reason")}
            />
            {form.formState.errors.amendment_reason ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.amendment_reason.message}
              </p>
            ) : null}
          </div>
        ) : null
      }
      onSubmit={form.handleSubmit(async (values) => {
        if (isAmending && amendTarget) {
          const payload = {
            body: values.body,
            amendment_reason: values.amendment_reason ?? "",
          };
          if (isNursing) {
            await amendNursingNote.mutateAsync({
              noteUuid: amendTarget.uuid,
              payload,
            });
          } else {
            await amendClinicalNote.mutateAsync({
              noteUuid: amendTarget.uuid,
              payload,
            });
          }
          onAmendCleared?.();
        } else if (isNursing) {
          await createNursingNote.mutateAsync({ body: values.body });
        } else {
          await createClinicalNote.mutateAsync({ body: values.body });
        }
        form.reset({ body: "", amendment_reason: "" });
      })}
    />
  );
}

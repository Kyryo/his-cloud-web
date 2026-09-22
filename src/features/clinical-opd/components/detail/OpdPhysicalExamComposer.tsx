"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  useCreatePhysicalExam,
  useUpdatePhysicalExam,
} from "@/features/clinical-opd/hooks/use-clinical-opd";
import { physicalExamSchema } from "@/features/clinical-opd/schemas/clinical-opd.schema";
import type { EncounterPhysicalExam } from "@/features/clinical-opd/types/clinical-opd.types";
import { TherapyRichTextEditor } from "@/features/therapy/components/TherapyRichTextEditor";
import { useToast } from "@/providers/toast-provider";

export const PHYSICAL_EXAM_FORM_ID = "opd-physical-exam-form";
export const PHYSICAL_EXAM_EDIT_FORM_ID = "opd-edit-physical-exam-form";

type PhysicalExamFormValues = {
  section: "general" | "system" | "free_text";
  findings: string;
  system_code?: string;
};

const EMPTY_VALUES: PhysicalExamFormValues = {
  section: "general",
  findings: "",
  system_code: "",
};

function toFormValues(exam: EncounterPhysicalExam | null): PhysicalExamFormValues {
  if (!exam) {
    return EMPTY_VALUES;
  }

  return {
    section: exam.section as "general" | "system" | "free_text",
    findings: exam.findings,
    system_code: exam.system_code ?? "",
  };
}

type OpdPhysicalExamComposerProps = {
  visitUuid: string;
  encounterUuid: string;
  exam?: EncounterPhysicalExam | null;
  onSaved?: () => void;
  formId?: string;
  /** When false, omit the in-form Save row (e.g. dialog footer). */
  showFooterActions?: boolean;
};

export function OpdPhysicalExamComposer({
  visitUuid,
  encounterUuid,
  exam = null,
  onSaved,
  formId = PHYSICAL_EXAM_FORM_ID,
  showFooterActions = true,
}: OpdPhysicalExamComposerProps) {
  return (
    <OpdPhysicalExamComposerForm
      key={exam?.uuid ?? "new"}
      visitUuid={visitUuid}
      encounterUuid={encounterUuid}
      exam={exam}
      onSaved={onSaved}
      formId={formId}
      showFooterActions={showFooterActions}
    />
  );
}

function OpdPhysicalExamComposerForm({
  visitUuid,
  encounterUuid,
  exam,
  onSaved,
  formId,
  showFooterActions = true,
}: OpdPhysicalExamComposerProps) {
  const createPhysicalExam = useCreatePhysicalExam(visitUuid, encounterUuid);
  const updatePhysicalExam = useUpdatePhysicalExam(visitUuid, encounterUuid);
  const { success } = useToast();
  const [editorEpoch, setEditorEpoch] = useState(0);

  const form = useForm<PhysicalExamFormValues>({
    resolver: zodResolver(physicalExamSchema),
    defaultValues: toFormValues(exam ?? null),
  });

  const findingsValue =
    useWatch({ control: form.control, name: "findings" }) ?? "";
  const isSaving =
    createPhysicalExam.isPending || updatePhysicalExam.isPending;

  return (
    <form
      id={formId}
      className="space-y-4"
      data-testid="opd-physical-exam-composer"
      onSubmit={form.handleSubmit(async (values) => {
        const payload = {
          section: values.section,
          findings: values.findings,
          system_code: values.system_code,
        };

        if (exam?.uuid) {
          await updatePhysicalExam.mutateAsync({
            examUuid: exam.uuid,
            payload,
          });
          success({
            title: "Physical examination updated",
            description:
              "Your examination findings have been recorded for this encounter.",
          });
        } else {
          await createPhysicalExam.mutateAsync(payload);
          success({
            title: "Physical examination saved",
            description:
              "Your examination findings have been recorded for this encounter.",
          });
          form.reset(EMPTY_VALUES);
          setEditorEpoch((current) => current + 1);
        }

        onSaved?.();
      })}
    >
      <TherapyRichTextEditor
        key={`findings-${exam?.uuid ?? "new"}-${editorEpoch}`}
        value={findingsValue}
        onChange={(value) =>
          form.setValue("findings", value, { shouldValidate: true })
        }
        placeholder="Enter examination findings. Press Enter for a new line."
        disabled={isSaving}
        autoFocus={!exam}
        className="min-h-48"
      />
      {form.formState.errors.findings ? (
        <p className="text-sm text-destructive">
          {form.formState.errors.findings.message}
        </p>
      ) : null}

      {showFooterActions ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      ) : null}
    </form>
  );
}

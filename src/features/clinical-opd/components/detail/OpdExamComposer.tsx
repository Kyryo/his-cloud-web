"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { OpdInlineComposer } from "@/features/clinical-opd/components/detail/OpdInlineComposer";
import {
  useCreatePhysicalExam,
  useUpdatePhysicalExam,
} from "@/features/clinical-opd/hooks/use-clinical-opd";
import { physicalExamSchema } from "@/features/clinical-opd/schemas/clinical-opd.schema";
import type { EncounterPhysicalExam } from "@/features/clinical-opd/types/clinical-opd.types";
import { richTextToPlainText } from "@/features/clinical-opd/utils/rich-text";

type OpdExamComposerProps = {
  visitUuid: string;
  encounterUuid: string;
  exams: EncounterPhysicalExam[];
  isLoading?: boolean;
  disabled?: boolean;
};

function toFormValues(exam: EncounterPhysicalExam) {
  return {
    section: exam.section as "general" | "system" | "free_text",
    findings: richTextToPlainText(exam.findings),
    system_code: exam.system_code ?? "",
  };
}

export function OpdExamComposer({
  visitUuid,
  encounterUuid,
  exams,
  isLoading = false,
  disabled = false,
}: OpdExamComposerProps) {
  const createPhysicalExam = useCreatePhysicalExam(visitUuid, encounterUuid);
  const updatePhysicalExam = useUpdatePhysicalExam(visitUuid, encounterUuid);
  const [examUuid, setExamUuid] = useState<string | null>(null);
  const hasHydratedRef = useRef(false);
  const examForm = useForm({
    resolver: zodResolver(physicalExamSchema),
    defaultValues: { section: "general" as const, findings: "", system_code: "" },
  });

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      await Promise.resolve();
      if (cancelled || isLoading || hasHydratedRef.current) {
        return;
      }

      const latestExam = exams[0];
      if (latestExam) {
        examForm.reset(toFormValues(latestExam));
        setExamUuid(latestExam.uuid);
      }
      hasHydratedRef.current = true;
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [examForm, exams, isLoading]);

  return (
    <OpdInlineComposer
      id="opd-exam-findings"
      label="Findings"
      placeholder="General appearance, systems examined, and notable findings"
      rows={5}
      error={examForm.formState.errors.findings?.message}
      submitLabel="Save examination"
      isPending={createPhysicalExam.isPending || updatePhysicalExam.isPending}
      disabled={disabled}
      data-testid="opd-exam-composer"
      textareaProps={examForm.register("findings")}
      onSubmit={examForm.handleSubmit(async (values) => {
        const payload = {
          section: values.section,
          findings: values.findings,
          system_code: values.system_code,
        };
        const savedExam = examUuid
          ? await updatePhysicalExam.mutateAsync({
              examUuid,
              payload,
            })
          : await createPhysicalExam.mutateAsync(payload);
        setExamUuid(savedExam.uuid);
        examForm.reset(toFormValues(savedExam));
      })}
    />
  );
}

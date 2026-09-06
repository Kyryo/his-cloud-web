"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ClientAvatar } from "@/components/client-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useOpdEncounterWorkspace } from "@/features/clinical-opd/components/detail/opd-encounter-workspace-context";
import { OpdEncounterTabSkeleton } from "@/features/clinical-opd/components/detail/OpdEncounterTabSkeleton";
import { OpdPhysicianTabShell } from "@/features/clinical-opd/components/detail/OpdPhysicianTabShell";
import {
  useCreatePhysicalExam,
  useEncounterWorkspace,
  useUpdatePhysicalExam,
} from "@/features/clinical-opd/hooks/use-clinical-opd";
import { physicalExamSchema } from "@/features/clinical-opd/schemas/clinical-opd.schema";
import type { EncounterPhysicalExam } from "@/features/clinical-opd/types/clinical-opd.types";
import { TherapyRichTextEditor } from "@/features/therapy/components/TherapyRichTextEditor";
import { isCustomerVisitActive } from "@/features/customers/utils/customer-visit-status";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import { useToast } from "@/providers/toast-provider";

const PHYSICAL_EXAM_FORM_ID = "opd-physical-exam-form";

type OpdPhysicalExaminationTabPanelProps = {
  visitUuid: string;
  encounterUuid: string;
  isActive?: boolean;
};

type PhysicalExamLastSaved = {
  recorded_at: string;
  recorded_by_name: string | null;
};

function toLastSaved(exam: EncounterPhysicalExam): PhysicalExamLastSaved {
  return {
    recorded_at: exam.recorded_at,
    recorded_by_name: exam.recorded_by_name,
  };
}

function toFormValues(exam: EncounterPhysicalExam) {
  return {
    section: exam.section as "general" | "system" | "free_text",
    findings: exam.findings,
    system_code: exam.system_code,
  };
}

export function OpdPhysicalExaminationTabPanel({
  visitUuid,
  encounterUuid,
  isActive = true,
}: OpdPhysicalExaminationTabPanelProps) {
  const { customer } = useOpdEncounterWorkspace();
  const { physicalExams } = useEncounterWorkspace(visitUuid, encounterUuid);
  const createPhysicalExam = useCreatePhysicalExam(visitUuid, encounterUuid);
  const updatePhysicalExam = useUpdatePhysicalExam(visitUuid, encounterUuid);
  const { success } = useToast();

  const visitIsActive = isCustomerVisitActive(customer?.visit_status);
  const canModify = visitIsActive;

  const [isEditing, setIsEditing] = useState(false);
  const [examUuid, setExamUuid] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<PhysicalExamLastSaved | null>(null);
  const [editorFocusKey, setEditorFocusKey] = useState(0);
  const hasHydratedRef = useRef(false);

  const examForm = useForm({
    resolver: zodResolver(physicalExamSchema),
    defaultValues: { section: "general", findings: "", system_code: "" },
  });

  const findingsValue = examForm.watch("findings");

  useEffect(() => {
    if (physicalExams.isLoading || hasHydratedRef.current || !customer) {
      return;
    }

    const latestExam = physicalExams.data?.[0];
    if (latestExam) {
      examForm.reset(toFormValues(latestExam));
      setExamUuid(latestExam.uuid);
      setLastSaved(toLastSaved(latestExam));
      setIsEditing(false);
    } else if (canModify) {
      setExamUuid(null);
      setIsEditing(true);
    } else {
      setExamUuid(null);
      setIsEditing(false);
    }

    hasHydratedRef.current = true;
  }, [canModify, customer, examForm, physicalExams.data, physicalExams.isLoading]);

  if (!isActive) {
    return null;
  }

  if (physicalExams.isLoading) {
    return <OpdEncounterTabSkeleton rows={4} />;
  }

  async function handleSave(values: {
    section: "general" | "system" | "free_text";
    findings: string;
    system_code?: string;
  }) {
    const isUpdate = Boolean(examUuid);
    const savedExam = isUpdate
      ? await updatePhysicalExam.mutateAsync({
          examUuid: examUuid!,
          payload: values,
        })
      : await createPhysicalExam.mutateAsync(values);

    setExamUuid(savedExam.uuid);
    setLastSaved(toLastSaved(savedExam));
    setIsEditing(false);
    success({
      title: isUpdate
        ? "Physical examination updated"
        : "Physical examination saved",
      description: "Your examination findings have been recorded for this encounter.",
    });
  }

  function handleEdit() {
    if (!canModify) {
      return;
    }

    setIsEditing(true);
    setEditorFocusKey((current) => current + 1);
  }

  function handleCancel() {
    const latestExam = physicalExams.data?.[0];
    if (latestExam) {
      examForm.reset(toFormValues(latestExam));
    } else {
      examForm.reset({ section: "general", findings: "", system_code: "" });
    }

    setIsEditing(false);
  }

  return (
    <OpdPhysicianTabShell visitUuid={visitUuid} encounterUuid={encounterUuid}>
      <PhysicalExaminationFormSection
        title="Physical examination"
        description="Document examination findings as the clinical review progresses."
        findings={findingsValue}
          isSaving={createPhysicalExam.isPending || updatePhysicalExam.isPending}
        isEditing={isEditing}
        canModify={canModify}
        lastSaved={lastSaved}
        editorFocusKey={editorFocusKey}
        autoFocus={isEditing && !lastSaved}
        onEdit={handleEdit}
        onCancel={handleCancel}
        onFindingsChange={(value) =>
          examForm.setValue("findings", value, { shouldValidate: true })
        }
        onSubmit={examForm.handleSubmit((values) => void handleSave(values))}
      />
    </OpdPhysicianTabShell>
  );
}

type PhysicalExaminationFormSectionProps = {
  title: string;
  description?: string;
  findings: string;
  isSaving: boolean;
  isEditing: boolean;
  canModify: boolean;
  lastSaved: PhysicalExamLastSaved | null;
  editorFocusKey: number;
  autoFocus?: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onFindingsChange: (value: string) => void;
  onSubmit: () => void;
};

function PhysicalExaminationFormSection({
  title,
  description,
  findings,
  isSaving,
  isEditing,
  canModify,
  lastSaved,
  editorFocusKey,
  autoFocus = false,
  onEdit,
  onCancel,
  onFindingsChange,
  onSubmit,
}: PhysicalExaminationFormSectionProps) {
  const savedByName = lastSaved?.recorded_by_name?.trim();

  function handleEditClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    window.setTimeout(() => {
      onEdit();
    }, 0);
  }

  const editor = (
    <TherapyRichTextEditor
      key={isEditing ? `editing-${editorFocusKey}` : "readonly"}
      value={findings}
      onChange={onFindingsChange}
      placeholder="Enter examination findings. Press Enter for a new line."
      disabled={isSaving}
      readOnly={!isEditing}
      autoFocus={autoFocus}
      focusAtEndKey={editorFocusKey}
      className="min-h-48"
    />
  );

  const footerActions = (
    <div className="flex flex-wrap items-center gap-2">
      {isEditing && canModify ? (
        <>
          <Button
            type="submit"
            form={PHYSICAL_EXAM_FORM_ID}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isSaving}
            onClick={onCancel}
            data-testid="opd-physical-exam-cancel-button"
          >
            Cancel
          </Button>
        </>
      ) : canModify ? (
        <Button
          type="button"
          variant="outline"
          onClick={handleEditClick}
          data-testid="opd-physical-exam-edit-button"
        >
          Edit
        </Button>
      ) : null}
    </div>
  );

  const footerMeta = lastSaved ? (
    <div
      className="flex items-center gap-2.5"
      data-testid="opd-physical-exam-last-saved"
    >
      <div className="text-right">
        <p className="text-xs font-medium text-brand-slate">
          {formatDisplayDateTime(lastSaved.recorded_at)}
        </p>
        {savedByName ? (
          <p className="text-xs text-brand-muted">by {savedByName}</p>
        ) : null}
      </div>
      {savedByName ? (
        <ClientAvatar name={savedByName} className="size-8" />
      ) : null}
    </div>
  ) : null;

  return (
    <section
      className="rounded-xl border border-dash-border/80 bg-white"
      data-testid="opd-physical-exam-form"
    >
      <div className="flex items-start justify-between gap-4 border-b border-dash-border/80 px-4 py-2 sm:px-5">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-brand-navy">{title}</h3>
          {description ? (
            <p className="mt-0.5 text-xs text-brand-muted">{description}</p>
          ) : null}
        </div>
        {lastSaved && !isEditing ? (
          <Badge
            variant="success"
            className="shrink-0"
            data-testid="opd-physical-exam-saved-badge"
          >
            Saved
          </Badge>
        ) : null}
      </div>

      {isEditing && canModify ? (
        <form
          id={PHYSICAL_EXAM_FORM_ID}
          className="px-4 py-3 sm:px-5 sm:py-3"
          onSubmit={onSubmit}
        >
          {editor}
        </form>
      ) : (
        <div className="px-4 py-3 sm:px-5 sm:py-3">{editor}</div>
      )}

      <div className="border-t border-dash-border/80">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
          {footerActions}
          {footerMeta}
        </div>
      </div>
    </section>
  );
}

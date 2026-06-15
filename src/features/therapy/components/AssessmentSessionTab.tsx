"use client";

import { useState } from "react";

import { TherapyFormActionBar } from "@/features/therapy/components/TherapyFormActionBar";
import { TherapyRichTextEditor } from "@/features/therapy/components/TherapyRichTextEditor";
import { updateTherapyVisitAssessment } from "@/features/therapy/services/therapy.service";
import type {
  TherapyAssessment,
  TherapyDiscipline,
} from "@/features/therapy/types/therapy.types";
import { useToast } from "@/providers/toast-provider";

export function AssessmentSessionTab({
  assessment,
  discipline,
  visitUuid,
  onAssessmentChanged,
  isReadOnly,
}: {
  assessment: TherapyAssessment;
  discipline: TherapyDiscipline;
  visitUuid: string;
  onAssessmentChanged: (assessment: TherapyAssessment) => void;
  isReadOnly: boolean;
}) {
  const { toast } = useToast();
  const [notes, setNotes] = useState(assessment.assessment_notes);
  const [isSaving, setIsSaving] = useState(false);

  async function saveAssessmentNotes() {
    setIsSaving(true);
    try {
      const updatedAssessment = await updateTherapyVisitAssessment(
        discipline,
        visitUuid,
        notes,
      );
      onAssessmentChanged(updatedAssessment);
      toast({
        variant: "success",
        title: "Assessment notes saved",
        description: "The assessment session has been updated.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not save assessment notes",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      className="pb-28"
      onSubmit={(event) => {
        event.preventDefault();
        void saveAssessmentNotes();
      }}
    >
      <header className="mb-7 border-b border-brand-border pb-5">
        <h2 className="text-xl font-semibold text-brand-navy">
          Assessment session
        </h2>
        <p className="mt-1 text-sm text-brand-muted">
          Record and update the initial assessment notes for this visit.
        </p>
      </header>

      <TherapyRichTextEditor
        value={notes}
        onChange={setNotes}
        placeholder="Document the assessment findings, clinical interpretation, and recommendations..."
        disabled={isSaving || isReadOnly}
      />

      {!isReadOnly ? (
        <TherapyFormActionBar
          isSubmitting={isSaving}
          message="Assessment notes ready to update"
          saveLabel="Save assessment"
          onCancel={() => setNotes(assessment.assessment_notes)}
        />
      ) : null}
    </form>
  );
}

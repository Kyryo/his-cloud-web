"use client";

import { useState } from "react";

import { PrimaryButton } from "@/components/ui/app-buttons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  OhColumnMessage,
  OhFormFooter,
  OhPanelSection,
  submitOnModEnter,
} from "@/features/occupational-health/components/OhEncounterColumns";
import type { OhExamination } from "@/features/occupational-health/types";
import { createFitnessAssessment } from "@/features/occupational-health/services/oh.service";
import {
  formatOhDate,
  newestFirst,
  todayIsoDate,
} from "@/features/occupational-health/utils/oh-format";
import {
  FITNESS_OUTCOMES,
  formatExamTypeLabel,
} from "@/features/occupational-health/utils/oh-labels";
import { appFont } from "@/lib/fonts";
import { useUser } from "@/providers/user-provider";
import { useToast } from "@/providers/toast-provider";

type OhFitnessFormsProps = {
  examinations: OhExamination[];
  onCreated: () => void;
};

export function OhFitnessForms({
  examinations,
  onCreated,
}: OhFitnessFormsProps) {
  if (examinations.length === 0) {
    return (
      <OhPanelSection>
        <OhColumnMessage data-testid="oh-fitness-locked">
          Add an examination before recording fitness.
        </OhColumnMessage>
      </OhPanelSection>
    );
  }

  return (
    <OhFitnessAssessmentForm examinations={examinations} onCreated={onCreated} />
  );
}

type OhFitnessAssessmentFormProps = {
  examinations: OhExamination[];
  onCreated: () => void;
};

function OhFitnessAssessmentForm({
  examinations,
  onCreated,
}: OhFitnessAssessmentFormProps) {
  const { userData } = useUser();
  const { toast } = useToast();
  const [pickedExaminationId, setPickedExaminationId] = useState("");
  const [outcome, setOutcome] = useState<string>("fit");
  const [reviewDate, setReviewDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sortedExaminations = newestFirst(
    examinations,
    (exam) => exam.examined_at ?? exam.created_at,
  );
  const examinationId = pickedExaminationId || String(sortedExaminations[0].id);
  const needsReviewDate = outcome === "temporarily_unfit";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!userData?.id) {
      toast({
        title: "Clinician required",
        description: "Sign in again if your user profile is missing.",
        variant: "error",
      });
      return;
    }
    if (needsReviewDate && !reviewDate) {
      toast({
        title: "Review date required",
        description: "Temporarily unfit assessments need a review date.",
        variant: "error",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await createFitnessAssessment({
        examination: Number(examinationId),
        outcome,
        assessed_at: new Date().toISOString(),
        review_date: reviewDate || null,
        clinician: userData.id,
      });
      setReviewDate("");
      toast({ variant: "success", title: "Fitness assessment saved" });
      onCreated();
    } catch (error) {
      toast({
        title: "Could not save fitness assessment",
        description: error instanceof Error ? error.message : undefined,
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <OhPanelSection title="Fitness assessment" data-testid="oh-fitness-assessment-form">
      <form
        onSubmit={(event) => void handleSubmit(event)}
        onKeyDown={submitOnModEnter}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <Label htmlFor="oh-fitness-exam">
            Examination <RequiredFieldMarker />
          </Label>
          <Select value={examinationId} onValueChange={setPickedExaminationId}>
            <SelectTrigger id="oh-fitness-exam" className="w-full">
              <SelectValue placeholder="Select examination" />
            </SelectTrigger>
            <SelectContent className={appFont.className}>
              {sortedExaminations.map((exam) => (
                <SelectItem key={exam.uuid} value={String(exam.id)}>
                  {formatExamTypeLabel(exam.exam_type)} ·{" "}
                  {formatOhDate(exam.examined_at ?? exam.created_at)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="oh-fitness-outcome">
            Outcome <RequiredFieldMarker />
          </Label>
          <Select value={outcome} onValueChange={setOutcome}>
            <SelectTrigger id="oh-fitness-outcome" className="w-full">
              <SelectValue placeholder="Outcome" />
            </SelectTrigger>
            <SelectContent className={appFont.className}>
              {FITNESS_OUTCOMES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="oh-fitness-review-date">
            Review date {needsReviewDate ? <RequiredFieldMarker /> : null}
          </Label>
          <Input
            id="oh-fitness-review-date"
            type="date"
            min={todayIsoDate()}
            value={reviewDate}
            onChange={(event) => setReviewDate(event.target.value)}
            required={needsReviewDate}
          />
        </div>
        <OhFormFooter>
          <PrimaryButton type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Record assessment"}
          </PrimaryButton>
        </OhFormFooter>
      </form>
    </OhPanelSection>
  );
}

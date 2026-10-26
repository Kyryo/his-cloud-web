"use client";

import { useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
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
import type {
  FitnessAssessment,
  OhExamination,
} from "@/features/occupational-health/types";
import {
  createFitnessAssessment,
  createFitnessCertificate,
} from "@/features/occupational-health/services/oh.service";
import {
  formatOhDate,
  latestFitnessAssessment,
  newestFirst,
  todayIsoDate,
} from "@/features/occupational-health/utils/oh-format";
import {
  FITNESS_OUTCOMES,
  formatExamTypeLabel,
  formatFitnessOutcome,
} from "@/features/occupational-health/utils/oh-labels";
import { appFont } from "@/lib/fonts";
import { useUser } from "@/providers/user-provider";
import { useToast } from "@/providers/toast-provider";

type OhFitnessFormsProps = {
  examinations: OhExamination[];
  assessments: FitnessAssessment[];
  onCreated: () => void;
};

export function OhFitnessForms({
  examinations,
  assessments,
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
    <>
      <OhFitnessAssessmentForm examinations={examinations} onCreated={onCreated} />
      <OhFitnessCertificateForm assessments={assessments} onCreated={onCreated} />
    </>
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

type OhFitnessCertificateFormProps = {
  assessments: FitnessAssessment[];
  onCreated: () => void;
};

function OhFitnessCertificateForm({
  assessments,
  onCreated,
}: OhFitnessCertificateFormProps) {
  const { userData } = useUser();
  const { toast } = useToast();
  const [pickedAssessmentId, setPickedAssessmentId] = useState("");
  const [validFrom, setValidFrom] = useState(todayIsoDate);
  const [validTo, setValidTo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const latest = latestFitnessAssessment(assessments);
  const assessmentId = pickedAssessmentId || (latest ? String(latest.id) : "");
  const selectedAssessment = assessments.find(
    (item) => String(item.id) === assessmentId,
  );

  if (!latest) {
    return (
      <OhPanelSection title="Fitness certificate">
        <OhColumnMessage data-testid="oh-certificate-locked">
          Record a fitness assessment to issue a certificate.
        </OhColumnMessage>
      </OhPanelSection>
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedAssessment || !userData?.id) {
      toast({ title: "Select an assessment to certify", variant: "error" });
      return;
    }
    if (validTo && validTo < validFrom) {
      toast({
        title: "Check the validity dates",
        description: "Valid to must be on or after valid from.",
        variant: "error",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await createFitnessCertificate({
        assessment: selectedAssessment.id,
        version: 1,
        status: "issued",
        valid_from: validFrom,
        valid_to: validTo || null,
        signed_at: new Date().toISOString(),
        signed_by: userData.id,
        payload: { outcome: selectedAssessment.outcome },
      });
      setValidTo("");
      toast({ variant: "success", title: "Fitness certificate issued" });
      onCreated();
    } catch (error) {
      toast({
        title: "Could not issue certificate",
        description: error instanceof Error ? error.message : undefined,
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <OhPanelSection
      title="Fitness certificate"
      description="Issued certificates are visible to HR without clinical detail."
      data-testid="oh-fitness-certificate-form"
    >
      <form
        onSubmit={(event) => void handleSubmit(event)}
        onKeyDown={submitOnModEnter}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <Label htmlFor="oh-cert-assessment">
            Assessment <RequiredFieldMarker />
          </Label>
          <Select value={assessmentId} onValueChange={setPickedAssessmentId}>
            <SelectTrigger id="oh-cert-assessment" className="w-full">
              <SelectValue placeholder="Assessment" />
            </SelectTrigger>
            <SelectContent className={appFont.className}>
              {newestFirst(assessments, (item) => item.assessed_at).map((item) => (
                <SelectItem key={item.uuid} value={String(item.id)}>
                  {formatFitnessOutcome(item.outcome)} ·{" "}
                  {formatOhDate(item.assessed_at)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="oh-cert-valid-from">
              Valid from <RequiredFieldMarker />
            </Label>
            <Input
              id="oh-cert-valid-from"
              type="date"
              value={validFrom}
              onChange={(event) => setValidFrom(event.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="oh-cert-valid-to">Valid to</Label>
            <Input
              id="oh-cert-valid-to"
              type="date"
              min={validFrom}
              value={validTo}
              onChange={(event) => setValidTo(event.target.value)}
            />
          </div>
        </div>
        <OhFormFooter>
          <SecondaryButton type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Issuing…" : "Issue certificate"}
          </SecondaryButton>
        </OhFormFooter>
      </form>
    </OhPanelSection>
  );
}

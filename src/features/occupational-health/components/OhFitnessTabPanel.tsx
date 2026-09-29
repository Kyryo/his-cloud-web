"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  FitnessAssessment,
  FitnessCertificate,
  OhExamination,
} from "@/features/occupational-health/types";
import {
  createFitnessAssessment,
  createFitnessCertificate,
  withdrawFitnessCertificate,
} from "@/features/occupational-health/services/oh.service";
import { useUser } from "@/providers/user-provider";
import { useToast } from "@/providers/toast-provider";

const OUTCOMES = [
  { value: "fit", label: "Fit" },
  { value: "fit_with_restrictions", label: "Fit with restrictions" },
  { value: "temporarily_unfit", label: "Temporarily unfit" },
  { value: "permanently_unfit", label: "Permanently unfit for job" },
  { value: "unfit", label: "Unfit" },
  { value: "deferred", label: "Deferred" },
] as const;

type OhFitnessTabPanelProps = {
  examinations: OhExamination[];
  assessments: FitnessAssessment[];
  certificates: FitnessCertificate[];
  onCreated: () => void;
};

export function OhFitnessTabPanel({
  examinations,
  assessments,
  certificates,
  onCreated,
}: OhFitnessTabPanelProps) {
  const { userData } = useUser();
  const { toast } = useToast();
  const [examinationId, setExaminationId] = useState<string>(
    examinations[0] ? String(examinations[0].id) : "",
  );
  const [outcome, setOutcome] = useState<string>("fit");
  const [reviewDate, setReviewDate] = useState("");
  const [certificateAssessmentId, setCertificateAssessmentId] = useState<string>(
    assessments[0] ? String(assessments[0].id) : "",
  );
  const [validFrom, setValidFrom] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [validTo, setValidTo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawingUuid, setWithdrawingUuid] = useState<string | null>(null);

  const needsReviewDate = outcome === "temporarily_unfit";

  async function handleAssessmentSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!examinationId || !userData?.id) {
      toast({
        title: "Clinician required",
        description: "Sign in again if your user profile is missing.",
        variant: "destructive",
      });
      return;
    }
    if (needsReviewDate && !reviewDate) {
      toast({
        title: "Review date required",
        description: "Temporarily unfit assessments need a review date.",
        variant: "destructive",
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
      toast({ title: "Fitness assessment saved" });
      onCreated();
    } catch (error) {
      toast({
        title: "Could not save fitness assessment",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCertificateSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!certificateAssessmentId || !userData?.id) {
      toast({
        title: "Clinician required",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await createFitnessCertificate({
        assessment: Number(certificateAssessmentId),
        version: 1,
        status: "issued",
        valid_from: validFrom,
        valid_to: validTo || null,
        signed_at: new Date().toISOString(),
        signed_by: userData.id,
        payload: { outcome },
      });
      toast({ title: "Fitness certificate issued" });
      onCreated();
    } catch (error) {
      toast({
        title: "Could not issue certificate",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleWithdraw(uuid: string) {
    setWithdrawingUuid(uuid);
    try {
      await withdrawFitnessCertificate(uuid);
      toast({ title: "Certificate withdrawn" });
      onCreated();
    } catch (error) {
      toast({
        title: "Could not withdraw certificate",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    } finally {
      setWithdrawingUuid(null);
    }
  }

  if (examinations.length === 0) {
    return (
      <p className="text-sm text-brand-muted" data-testid="oh-fitness-tab">
        Add an examination before recording fitness.
      </p>
    );
  }

  return (
    <div className="space-y-6" data-testid="oh-fitness-tab">
      <form
        onSubmit={(event) => void handleAssessmentSubmit(event)}
        className="grid gap-4 rounded-xl border border-brand-border bg-white p-4 md:grid-cols-2"
      >
        <div className="space-y-2">
          <Label htmlFor="oh-fitness-exam">Examination</Label>
          <Select value={examinationId} onValueChange={setExaminationId}>
            <SelectTrigger id="oh-fitness-exam">
              <SelectValue placeholder="Select examination" />
            </SelectTrigger>
            <SelectContent>
              {examinations.map((exam) => (
                <SelectItem key={exam.uuid} value={String(exam.id)}>
                  {exam.exam_type.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="oh-fitness-outcome">Outcome</Label>
          <Select value={outcome} onValueChange={setOutcome}>
            <SelectTrigger id="oh-fitness-outcome">
              <SelectValue placeholder="Outcome" />
            </SelectTrigger>
            <SelectContent>
              {OUTCOMES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="oh-fitness-review-date">
            Review date{needsReviewDate ? " (required)" : " (optional)"}
          </Label>
          <Input
            id="oh-fitness-review-date"
            type="date"
            value={reviewDate}
            onChange={(event) => setReviewDate(event.target.value)}
            required={needsReviewDate}
          />
        </div>
        <div className="md:col-span-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Record fitness assessment"}
          </Button>
        </div>
      </form>

      <ul className="divide-y rounded-xl border border-brand-border bg-white">
        {assessments.length === 0 ? (
          <li className="px-4 py-3 text-sm text-brand-muted">
            No fitness assessments yet.
          </li>
        ) : (
          assessments.map((item) => (
            <li key={item.uuid} className="px-4 py-3 text-sm capitalize">
              {item.outcome.replace(/_/g, " ")}
              {item.review_date ? (
                <span className="text-brand-muted">
                  {" "}
                  · review {item.review_date}
                </span>
              ) : null}
            </li>
          ))
        )}
      </ul>

      {assessments.length > 0 ? (
        <form
          onSubmit={(event) => void handleCertificateSubmit(event)}
          className="grid gap-4 rounded-xl border border-brand-border bg-white p-4 md:grid-cols-2"
        >
          <div className="space-y-2 md:col-span-2">
            <h3 className="text-sm font-semibold text-brand-navy">
              Issue fitness certificate
            </h3>
          </div>
          <div className="space-y-2">
            <Label htmlFor="oh-cert-assessment">Assessment</Label>
            <Select
              value={certificateAssessmentId}
              onValueChange={setCertificateAssessmentId}
            >
              <SelectTrigger id="oh-cert-assessment">
                <SelectValue placeholder="Assessment" />
              </SelectTrigger>
              <SelectContent>
                {assessments.map((item) => (
                  <SelectItem key={item.uuid} value={String(item.id)}>
                    {item.outcome.replace(/_/g, " ")} ·{" "}
                    {item.assessed_at.slice(0, 10)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="oh-cert-valid-from">Valid from</Label>
            <Input
              id="oh-cert-valid-from"
              type="date"
              value={validFrom}
              onChange={(event) => setValidFrom(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="oh-cert-valid-to">Valid to (optional)</Label>
            <Input
              id="oh-cert-valid-to"
              type="date"
              value={validTo}
              onChange={(event) => setValidTo(event.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Issuing…" : "Issue certificate"}
            </Button>
          </div>
        </form>
      ) : null}

      <ul className="divide-y rounded-xl border border-brand-border bg-white">
        {certificates.length === 0 ? (
          <li className="px-4 py-3 text-sm text-brand-muted">
            No fitness certificates yet.
          </li>
        ) : (
          certificates.map((item) => (
            <li
              key={item.uuid}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
            >
              <span className="capitalize">
                v{item.version} · {item.status} · {item.valid_from}
                {item.valid_to ? ` → ${item.valid_to}` : ""}
              </span>
              {item.status === "issued" || item.status === "amended" ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={withdrawingUuid === item.uuid}
                  onClick={() => void handleWithdraw(item.uuid)}
                >
                  {withdrawingUuid === item.uuid ? "Withdrawing…" : "Withdraw"}
                </Button>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

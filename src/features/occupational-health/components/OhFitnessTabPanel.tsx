"use client";

import { ShieldCheck } from "lucide-react";
import { useState } from "react";

import { DetailTabEmptyState } from "@/components/detail/detail-tab-empty-state";
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
import {
  OhConsultContentPanel,
  OhConsultFormLocked,
  OhConsultFormPanel,
  OhConsultLayout,
} from "@/features/occupational-health/components/OhConsultLayout";
import { OhRecordCard } from "@/features/occupational-health/components/OhRecordCard";
import {
  createFitnessAssessment,
  createFitnessCertificate,
  withdrawFitnessCertificate,
} from "@/features/occupational-health/services/oh.service";
import type {
  FitnessAssessment,
  FitnessCertificate,
  OhExamination,
} from "@/features/occupational-health/types";
import { formatDisplayDate } from "@/features/customers/utils/format-customer";
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
  visitUuid: string;
  encounterUuid: string;
  examinations: OhExamination[];
  assessments: FitnessAssessment[];
  certificates: FitnessCertificate[];
  onCreated: () => void;
};

export function OhFitnessTabPanel({
  visitUuid,
  encounterUuid,
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
  const canRecord = examinations.length > 0;

  async function handleAssessmentSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!examinationId || !userData?.id) {
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

  async function handleCertificateSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!certificateAssessmentId || !userData?.id) {
      toast({
        title: "Clinician required",
        variant: "error",
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

  async function handleWithdraw(uuid: string) {
    setWithdrawingUuid(uuid);
    try {
      await withdrawFitnessCertificate(uuid);
      toast({ variant: "success", title: "Certificate withdrawn" });
      onCreated();
    } catch (error) {
      toast({
        title: "Could not withdraw certificate",
        description: error instanceof Error ? error.message : undefined,
        variant: "error",
      });
    } finally {
      setWithdrawingUuid(null);
    }
  }

  return (
    <OhConsultLayout
      visitUuid={visitUuid}
      encounterUuid={encounterUuid}
      historySection="fitness"
      wideForm
      data-testid="oh-fitness-tab"
      form={
        <OhConsultFormPanel
          title="Fitness"
          description="Assess fitness for work against this visit’s examination."
        >
          {!canRecord ? (
            <OhConsultFormLocked message="Add an examination before recording fitness." />
          ) : (
            <div className="space-y-8">
              <form
                onSubmit={(event) => void handleAssessmentSubmit(event)}
                className="space-y-4"
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
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Saving…" : "Record assessment"}
                </Button>
              </form>

              {assessments.length > 0 ? (
                <form
                  onSubmit={(event) => void handleCertificateSubmit(event)}
                  className="space-y-4 border-t border-dash-border/70 pt-6"
                >
                  <div>
                    <p className="text-sm font-semibold text-brand-navy">
                      Issue certificate
                    </p>
                    <p className="mt-1 text-xs text-dash-muted">
                      Sign and issue a fitness certificate for an assessment.
                    </p>
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
                  <div className="grid grid-cols-2 gap-3">
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
                      <Label htmlFor="oh-cert-valid-to">Valid to</Label>
                      <Input
                        id="oh-cert-valid-to"
                        type="date"
                        value={validTo}
                        onChange={(event) => setValidTo(event.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? "Issuing…" : "Issue certificate"}
                  </Button>
                </form>
              ) : null}
            </div>
          )}
        </OhConsultFormPanel>
      }
      content={
        <OhConsultContentPanel
          title="Fitness records"
          count={assessments.length + certificates.length}
        >
          {assessments.length === 0 && certificates.length === 0 ? (
            <DetailTabEmptyState
              icon={ShieldCheck}
              title="No fitness records yet"
              description="Record a fitness assessment on the left. Certificates will appear here once issued."
            />
          ) : (
            <div className="space-y-6">
              {assessments.length > 0 ? (
                <section className="space-y-3">
                  <h3 className="text-xs font-medium uppercase tracking-wide text-dash-muted">
                    Assessments
                  </h3>
                  <ul className="space-y-3">
                    {assessments.map((item) => (
                      <li key={item.uuid}>
                        <OhRecordCard
                          title={
                            <span className="capitalize">
                              {item.outcome.replace(/_/g, " ")}
                            </span>
                          }
                          meta={[
                            formatDisplayDate(item.assessed_at),
                            item.review_date
                              ? `review ${formatDisplayDate(item.review_date)}`
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {certificates.length > 0 ? (
                <section className="space-y-3">
                  <h3 className="text-xs font-medium uppercase tracking-wide text-dash-muted">
                    Certificates
                  </h3>
                  <ul className="space-y-3">
                    {certificates.map((item) => (
                      <li key={item.uuid}>
                        <OhRecordCard
                          title={
                            <span className="capitalize">
                              v{item.version} · {item.status}
                            </span>
                          }
                          meta={`${formatDisplayDate(item.valid_from)}${
                            item.valid_to
                              ? ` → ${formatDisplayDate(item.valid_to)}`
                              : ""
                          }`}
                          actions={
                            item.status === "issued" ||
                            item.status === "amended" ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={withdrawingUuid === item.uuid}
                                onClick={() => void handleWithdraw(item.uuid)}
                              >
                                {withdrawingUuid === item.uuid
                                  ? "Withdrawing…"
                                  : "Withdraw"}
                              </Button>
                            ) : null
                          }
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          )}
        </OhConsultContentPanel>
      }
    />
  );
}

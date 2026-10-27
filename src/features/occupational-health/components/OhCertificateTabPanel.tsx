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
import { createFitnessCertificate } from "@/features/occupational-health/services/oh.service";
import type { FitnessAssessment } from "@/features/occupational-health/types";
import {
  formatOhDate,
  latestFitnessAssessment,
  newestFirst,
  todayIsoDate,
} from "@/features/occupational-health/utils/oh-format";
import { formatFitnessOutcome } from "@/features/occupational-health/utils/oh-labels";
import { appFont } from "@/lib/fonts";
import { useToast } from "@/providers/toast-provider";
import { useUser } from "@/providers/user-provider";

type OhCertificateFormProps = {
  assessments: FitnessAssessment[];
  onCreated: () => void;
};

export function OhCertificateForm({
  assessments,
  onCreated,
}: OhCertificateFormProps) {
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
      <OhPanelSection>
        <OhColumnMessage data-testid="oh-certificate-locked">
          Record a fitness assessment before issuing a certificate.
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
      title="Issue certificate"
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
          <PrimaryButton type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Issuing…" : "Issue certificate"}
          </PrimaryButton>
        </OhFormFooter>
      </form>
    </OhPanelSection>
  );
}

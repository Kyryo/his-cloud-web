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
import { Textarea } from "@/components/ui/textarea";
import {
  OhFormFooter,
  OhPanelSection,
  submitOnModEnter,
} from "@/features/occupational-health/components/OhEncounterColumns";
import { createIodCase } from "@/features/occupational-health/services/oh.service";
import { todayIsoDate } from "@/features/occupational-health/utils/oh-format";
import { appFont } from "@/lib/fonts";
import { useToast } from "@/providers/toast-provider";

const SEVERITIES = [
  { value: "minor", label: "Minor" },
  { value: "moderate", label: "Moderate" },
  { value: "major", label: "Major" },
  { value: "fatal", label: "Fatal" },
] as const;

const SAFETY_CLASSES = [
  { value: "near_miss", label: "Near miss" },
  { value: "first_aid", label: "First aid" },
  { value: "medical_treatment", label: "Medical treatment" },
  { value: "lost_time", label: "Lost time" },
  { value: "fatality", label: "Fatality" },
] as const;

type OhIodFormProps = {
  encounterId: number;
  customerId: number;
  tenantId: number;
  onCreated: () => void;
};

export function OhIodForm({
  encounterId,
  customerId,
  tenantId,
  onCreated,
}: OhIodFormProps) {
  const { toast } = useToast();
  const [severity, setSeverity] = useState("minor");
  const [onsetDate, setOnsetDate] = useState(todayIsoDate);
  const [sheReference, setSheReference] = useState("");
  const [mechanism, setMechanism] = useState("");
  const [bodyPart, setBodyPart] = useState("");
  const [incidentLocation, setIncidentLocation] = useState("");
  const [safetyClassification, setSafetyClassification] = useState("first_aid");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!description.trim()) {
      toast({ title: "Describe the incident", variant: "error" });
      return;
    }
    setIsSubmitting(true);
    try {
      await createIodCase({
        tenant: tenantId,
        customer: customerId,
        encounter: encounterId,
        severity,
        onset_date: onsetDate,
        description: description.trim(),
        she_reference: sheReference.trim(),
        mechanism: mechanism.trim(),
        body_part: bodyPart.trim(),
        incident_location: incidentLocation.trim(),
        safety_classification: safetyClassification,
        work_related: true,
        status: "open",
      });
      setDescription("");
      setSheReference("");
      setMechanism("");
      setBodyPart("");
      setIncidentLocation("");
      toast({ variant: "success", title: "IOD case opened" });
      onCreated();
    } catch (error) {
      toast({
        title: "Could not create IOD case",
        description: error instanceof Error ? error.message : undefined,
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <OhPanelSection description="Open an injury-on-duty case linked to this encounter.">
      <form
        onSubmit={(event) => void handleSubmit(event)}
        onKeyDown={submitOnModEnter}
        className="space-y-4"
        data-testid="oh-iod-form"
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="oh-iod-severity">
              Severity <RequiredFieldMarker />
            </Label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger id="oh-iod-severity" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={appFont.className}>
                {SEVERITIES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="oh-iod-onset">
              Onset date <RequiredFieldMarker />
            </Label>
            <Input
              id="oh-iod-onset"
              type="date"
              max={todayIsoDate()}
              value={onsetDate}
              onChange={(event) => setOnsetDate(event.target.value)}
              required
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="oh-iod-safety">
            Safety classification <RequiredFieldMarker />
          </Label>
          <Select value={safetyClassification} onValueChange={setSafetyClassification}>
            <SelectTrigger id="oh-iod-safety" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={appFont.className}>
              {SAFETY_CLASSES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="oh-iod-mechanism">Mechanism</Label>
            <Input
              id="oh-iod-mechanism"
              value={mechanism}
              onChange={(event) => setMechanism(event.target.value)}
              placeholder="e.g. slip"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="oh-iod-body-part">Body part</Label>
            <Input
              id="oh-iod-body-part"
              value={bodyPart}
              onChange={(event) => setBodyPart(event.target.value)}
              placeholder="e.g. right hand"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="oh-iod-location">Incident location</Label>
          <Input
            id="oh-iod-location"
            value={incidentLocation}
            onChange={(event) => setIncidentLocation(event.target.value)}
            placeholder="Where on site it happened"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="oh-iod-she-ref">SHE reference</Label>
          <Input
            id="oh-iod-she-ref"
            value={sheReference}
            onChange={(event) => setSheReference(event.target.value)}
            placeholder="Employer / SHE case reference"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="oh-iod-description">
            Description <RequiredFieldMarker />
          </Label>
          <Textarea
            id="oh-iod-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={4}
            required
          />
        </div>
        <OhFormFooter>
          <PrimaryButton type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Open IOD case"}
          </PrimaryButton>
        </OhFormFooter>
      </form>
    </OhPanelSection>
  );
}

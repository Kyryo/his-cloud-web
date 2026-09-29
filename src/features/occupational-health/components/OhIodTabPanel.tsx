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
import { Textarea } from "@/components/ui/textarea";
import type { IodCase } from "@/features/occupational-health/types";
import {
  createIodCase,
  downloadIodStatutoryPack,
} from "@/features/occupational-health/services/oh.service";
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

type OhIodTabPanelProps = {
  encounterId: number;
  customerId: number;
  tenantId: number;
  iodCases: IodCase[];
  onCreated: () => void;
};

export function OhIodTabPanel({
  encounterId,
  customerId,
  tenantId,
  iodCases,
  onCreated,
}: OhIodTabPanelProps) {
  const { toast } = useToast();
  const [severity, setSeverity] = useState("minor");
  const [onsetDate, setOnsetDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [sheReference, setSheReference] = useState("");
  const [mechanism, setMechanism] = useState("");
  const [bodyPart, setBodyPart] = useState("");
  const [incidentLocation, setIncidentLocation] = useState("");
  const [safetyClassification, setSafetyClassification] = useState("first_aid");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadingUuid, setDownloadingUuid] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await createIodCase({
        tenant: tenantId,
        customer: customerId,
        encounter: encounterId,
        severity,
        onset_date: onsetDate,
        description,
        she_reference: sheReference,
        mechanism,
        body_part: bodyPart,
        incident_location: incidentLocation,
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

  async function handleStatutoryPack(caseUuid: string) {
    setDownloadingUuid(caseUuid);
    try {
      const { blob, filename } = await downloadIodStatutoryPack(caseUuid);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
      toast({ variant: "success", title: "Statutory pack downloaded" });
    } catch (error) {
      toast({
        title: "Could not load statutory pack",
        description: error instanceof Error ? error.message : undefined,
        variant: "error",
      });
    } finally {
      setDownloadingUuid(null);
    }
  }

  return (
    <div className="space-y-6" data-testid="oh-iod-tab">
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="grid gap-4 rounded-xl border border-brand-border bg-white p-4 md:grid-cols-2"
      >
        <div className="space-y-2">
          <Label htmlFor="oh-iod-severity">Severity</Label>
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger id="oh-iod-severity">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEVERITIES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="oh-iod-safety">Safety classification</Label>
          <Select
            value={safetyClassification}
            onValueChange={setSafetyClassification}
          >
            <SelectTrigger id="oh-iod-safety">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SAFETY_CLASSES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="oh-iod-onset">Onset date</Label>
          <Input
            id="oh-iod-onset"
            type="date"
            value={onsetDate}
            onChange={(event) => setOnsetDate(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="oh-iod-she-ref">SHE reference</Label>
          <Input
            id="oh-iod-she-ref"
            value={sheReference}
            onChange={(event) => setSheReference(event.target.value)}
            placeholder="Employer / SHE case reference"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="oh-iod-mechanism">Mechanism</Label>
          <Input
            id="oh-iod-mechanism"
            value={mechanism}
            onChange={(event) => setMechanism(event.target.value)}
            placeholder="e.g. slip, struck by, chemical exposure"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="oh-iod-body-part">Body part</Label>
          <Input
            id="oh-iod-body-part"
            value={bodyPart}
            onChange={(event) => setBodyPart(event.target.value)}
            placeholder="e.g. right hand, lower back"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="oh-iod-location">Incident location</Label>
          <Input
            id="oh-iod-location"
            value={incidentLocation}
            onChange={(event) => setIncidentLocation(event.target.value)}
            placeholder="Where on site the incident occurred"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="oh-iod-description">Description</Label>
          <Textarea
            id="oh-iod-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            required
          />
        </div>
        <div className="md:col-span-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Open IOD case"}
          </Button>
        </div>
      </form>

      <ul className="divide-y rounded-xl border border-brand-border bg-white">
        {iodCases.length === 0 ? (
          <li className="px-4 py-3 text-sm text-brand-muted">No IOD cases linked.</li>
        ) : (
          iodCases.map((item) => (
            <li
              key={item.uuid}
              className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 text-sm"
            >
              <div>
                <div className="font-medium capitalize">
                  {item.severity} — {item.status.replace(/_/g, " ")}
                  {item.safety_classification
                    ? ` · ${item.safety_classification.replace(/_/g, " ")}`
                    : ""}
                </div>
                {item.she_reference ? (
                  <p className="text-brand-muted">SHE ref: {item.she_reference}</p>
                ) : null}
                {(item.mechanism || item.body_part || item.incident_location) && (
                  <p className="mt-1 text-brand-muted">
                    {[item.mechanism, item.body_part, item.incident_location]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
                <p className="mt-1 text-brand-muted">{item.description}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={downloadingUuid === item.uuid}
                onClick={() => void handleStatutoryPack(item.uuid)}
              >
                {downloadingUuid === item.uuid ? "Loading…" : "Statutory pack"}
              </Button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

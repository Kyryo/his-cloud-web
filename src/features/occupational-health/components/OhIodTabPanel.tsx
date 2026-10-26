"use client";

import { AlertTriangle } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  OhConsultContentPanel,
  OhConsultFormPanel,
  OhConsultLayout,
} from "@/features/occupational-health/components/OhConsultLayout";
import { OhRecordCard } from "@/features/occupational-health/components/OhRecordCard";
import {
  createIodCase,
  downloadIodStatutoryPack,
} from "@/features/occupational-health/services/oh.service";
import type { IodCase } from "@/features/occupational-health/types";
import { formatDisplayDate } from "@/features/customers/utils/format-customer";
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
  visitUuid: string;
  encounterUuid: string;
  encounterId: number;
  customerId: number;
  tenantId: number;
  iodCases: IodCase[];
  onCreated: () => void;
};

export function OhIodTabPanel({
  visitUuid,
  encounterUuid,
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
    <OhConsultLayout
      visitUuid={visitUuid}
      encounterUuid={encounterUuid}
      historySection="iod"
      wideForm
      data-testid="oh-iod-tab"
      form={
        <OhConsultFormPanel
          title="IOD case"
          description="Open an injury on duty case linked to this occupational health visit."
        >
          <form
            onSubmit={(event) => void handleSubmit(event)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-3">
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
                <Label htmlFor="oh-iod-safety">Safety class</Label>
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
                placeholder="e.g. slip, struck by"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oh-iod-body-part">Body part</Label>
              <Input
                id="oh-iod-body-part"
                value={bodyPart}
                onChange={(event) => setBodyPart(event.target.value)}
                placeholder="e.g. right hand"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oh-iod-location">Incident location</Label>
              <Input
                id="oh-iod-location"
                value={incidentLocation}
                onChange={(event) => setIncidentLocation(event.target.value)}
                placeholder="Where on site"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oh-iod-description">Description</Label>
              <Textarea
                id="oh-iod-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                required
              />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Saving…" : "Open IOD case"}
            </Button>
          </form>
        </OhConsultFormPanel>
      }
      content={
        <OhConsultContentPanel title="IOD cases" count={iodCases.length}>
          {iodCases.length === 0 ? (
            <DetailTabEmptyState
              icon={AlertTriangle}
              title="No IOD cases yet"
              description="Open a case on the left. Linked IOD records for this visit will show here."
            />
          ) : (
            <ul className="space-y-3">
              {iodCases.map((item) => (
                <li key={item.uuid}>
                  <OhRecordCard
                    title={
                      <span className="capitalize">
                        {item.severity} — {item.status.replace(/_/g, " ")}
                      </span>
                    }
                    meta={[
                      formatDisplayDate(item.onset_date),
                      item.safety_classification
                        ? item.safety_classification.replace(/_/g, " ")
                        : null,
                      item.she_reference ? `SHE ${item.she_reference}` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                    actions={
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={downloadingUuid === item.uuid}
                        onClick={() => void handleStatutoryPack(item.uuid)}
                      >
                        {downloadingUuid === item.uuid
                          ? "Loading…"
                          : "Statutory pack"}
                      </Button>
                    }
                  >
                    {(item.mechanism ||
                      item.body_part ||
                      item.incident_location) && (
                      <p className="text-sm text-brand-muted">
                        {[item.mechanism, item.body_part, item.incident_location]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                    {item.description ? (
                      <p className="text-sm leading-relaxed text-brand-slate">
                        {item.description}
                      </p>
                    ) : null}
                  </OhRecordCard>
                </li>
              ))}
            </ul>
          )}
        </OhConsultContentPanel>
      }
    />
  );
}

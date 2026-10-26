"use client";

import { FlaskConical } from "lucide-react";
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
import { createOhExamFinding } from "@/features/occupational-health/services/oh.service";
import type {
  OhExamFinding,
  OhExamination,
} from "@/features/occupational-health/types";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import { useToast } from "@/providers/toast-provider";
import { cn } from "@/lib/utils";

type OhFindingsTabPanelProps = {
  visitUuid: string;
  encounterUuid: string;
  examinations: OhExamination[];
  findings: OhExamFinding[];
  onCreated: () => void;
};

export function OhFindingsTabPanel({
  visitUuid,
  encounterUuid,
  examinations,
  findings,
  onCreated,
}: OhFindingsTabPanelProps) {
  const { toast } = useToast();
  const [examinationId, setExaminationId] = useState<string>(
    examinations[0] ? String(examinations[0].id) : "",
  );
  const [code, setCode] = useState("");
  const [numericValue, setNumericValue] = useState("");
  const [unit, setUnit] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const canRecord = examinations.length > 0;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!examinationId) {
      return;
    }
    setIsSubmitting(true);
    try {
      await createOhExamFinding({
        examination: Number(examinationId),
        code,
        numeric_value: numericValue || null,
        unit,
        recorded_at: new Date().toISOString(),
        threshold_flag: "none",
      });
      setCode("");
      setNumericValue("");
      setUnit("");
      toast({ variant: "success", title: "Finding recorded" });
      onCreated();
    } catch (error) {
      toast({
        title: "Could not save finding",
        description: error instanceof Error ? error.message : undefined,
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <OhConsultLayout
      visitUuid={visitUuid}
      encounterUuid={encounterUuid}
      historySection="findings"
      data-testid="oh-findings-tab"
      form={
        <OhConsultFormPanel
          title="Finding"
          description="Capture measured or coded results for an examination on this visit."
        >
          {!canRecord ? (
            <OhConsultFormLocked message="Add an examination before recording findings." />
          ) : (
            <form
              onSubmit={(event) => void handleSubmit(event)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="oh-finding-exam">Examination</Label>
                <Select value={examinationId} onValueChange={setExaminationId}>
                  <SelectTrigger id="oh-finding-exam">
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
                <Label htmlFor="oh-finding-code">Code</Label>
                <Input
                  id="oh-finding-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="e.g. audiometry_left"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="oh-finding-value">Value</Label>
                  <Input
                    id="oh-finding-value"
                    value={numericValue}
                    onChange={(event) => setNumericValue(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oh-finding-unit">Unit</Label>
                  <Input
                    id="oh-finding-unit"
                    value={unit}
                    onChange={(event) => setUnit(event.target.value)}
                    placeholder="dB"
                  />
                </div>
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Saving…" : "Add finding"}
              </Button>
            </form>
          )}
        </OhConsultFormPanel>
      }
      content={
        <OhConsultContentPanel title="Findings" count={findings.length}>
          {findings.length === 0 ? (
            <DetailTabEmptyState
              icon={FlaskConical}
              title="No findings yet"
              description="Save a finding on the left. It will appear here for this visit."
            />
          ) : (
            <ul className="space-y-3">
              {findings.map((finding) => (
                <li key={finding.uuid}>
                  <OhRecordCard
                    title={finding.code}
                    meta={formatDisplayDateTime(finding.recorded_at)}
                  >
                    <p className="text-sm text-brand-slate">
                      {[finding.numeric_value, finding.unit, finding.coded_value]
                        .filter(Boolean)
                        .join(" ") || "—"}
                    </p>
                    {finding.threshold_flag &&
                    finding.threshold_flag !== "none" ? (
                      <span
                        className={cn(
                          "mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium uppercase",
                          finding.threshold_flag === "alert"
                            ? "bg-red-50 text-red-700"
                            : "bg-amber-50 text-amber-800",
                        )}
                      >
                        {finding.threshold_flag}
                      </span>
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

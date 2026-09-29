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
import type { OhExamFinding, OhExamination } from "@/features/occupational-health/types";
import { createOhExamFinding } from "@/features/occupational-health/services/oh.service";
import { useToast } from "@/providers/toast-provider";

type OhFindingsTabPanelProps = {
  examinations: OhExamination[];
  findings: OhExamFinding[];
  onCreated: () => void;
};

export function OhFindingsTabPanel({
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
      toast({ title: "Finding recorded" });
      onCreated();
    } catch (error) {
      toast({
        title: "Could not save finding",
        description: error instanceof Error ? error.message : undefined,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (examinations.length === 0) {
    return (
      <p className="text-sm text-brand-muted" data-testid="oh-findings-tab">
        Add an examination before recording findings.
      </p>
    );
  }

  return (
    <div className="space-y-6" data-testid="oh-findings-tab">
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="grid gap-4 rounded-xl border border-brand-border bg-white p-4 md:grid-cols-2"
      >
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="oh-finding-exam">Examination</Label>
          <Select value={examinationId} onValueChange={setExaminationId}>
            <SelectTrigger id="oh-finding-exam">
              <SelectValue placeholder="Select examination" />
            </SelectTrigger>
            <SelectContent>
              {examinations.map((exam) => (
                <SelectItem key={exam.uuid} value={String(exam.id)}>
                  {exam.exam_type.replace(/_/g, " ")} ({exam.uuid.slice(0, 8)})
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
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="oh-finding-value">Numeric value</Label>
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
          />
        </div>
        <div className="md:col-span-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Add finding"}
          </Button>
        </div>
      </form>

      <ul className="divide-y rounded-xl border border-brand-border bg-white">
        {findings.length === 0 ? (
          <li className="px-4 py-3 text-sm text-brand-muted">No findings yet.</li>
        ) : (
          findings.map((finding) => (
            <li key={finding.uuid} className="px-4 py-3 text-sm">
              <span className="font-medium">{finding.code}</span>
              {finding.numeric_value ? (
                <span className="text-brand-muted">
                  {" "}
                  — {finding.numeric_value} {finding.unit}
                </span>
              ) : null}
              {finding.threshold_flag && finding.threshold_flag !== "none" ? (
                <span
                  className={
                    finding.threshold_flag === "alert"
                      ? "ml-2 rounded bg-red-50 px-1.5 py-0.5 text-xs font-medium uppercase text-red-700"
                      : "ml-2 rounded bg-amber-50 px-1.5 py-0.5 text-xs font-medium uppercase text-amber-800"
                  }
                >
                  {finding.threshold_flag}
                </span>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

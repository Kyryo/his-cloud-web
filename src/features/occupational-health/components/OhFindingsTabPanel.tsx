"use client";

import { useRef, useState } from "react";
import { Activity } from "lucide-react";

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
  OhRecordItem,
  OhRecordList,
  OhRecordsEmpty,
  submitOnModEnter,
} from "@/features/occupational-health/components/OhEncounterColumns";
import { OhStatusChip } from "@/features/occupational-health/components/OhStatusChip";
import type { OhExamFinding, OhExamination } from "@/features/occupational-health/types";
import { createOhExamFinding } from "@/features/occupational-health/services/oh.service";
import {
  formatOhDate,
  newestFirst,
} from "@/features/occupational-health/utils/oh-format";
import { formatExamTypeLabel } from "@/features/occupational-health/utils/oh-labels";
import { appFont } from "@/lib/fonts";
import { useToast } from "@/providers/toast-provider";

function examOptionLabel(exam: OhExamination): string {
  return `${formatExamTypeLabel(exam.exam_type)} · ${formatOhDate(exam.examined_at ?? exam.created_at)}`;
}

type OhFindingFormProps = {
  examinations: OhExamination[];
  onCreated: () => void;
};

export function OhFindingForm({ examinations, onCreated }: OhFindingFormProps) {
  const { toast } = useToast();
  const codeInputRef = useRef<HTMLInputElement>(null);
  const [pickedExaminationId, setPickedExaminationId] = useState("");
  const [code, setCode] = useState("");
  const [numericValue, setNumericValue] = useState("");
  const [unit, setUnit] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (examinations.length === 0) {
    return (
      <OhPanelSection>
        <OhColumnMessage data-testid="oh-findings-locked">
          Add an examination before recording findings.
        </OhColumnMessage>
      </OhPanelSection>
    );
  }

  const sortedExaminations = newestFirst(
    examinations,
    (exam) => exam.examined_at ?? exam.created_at,
  );
  const examinationId = pickedExaminationId || String(sortedExaminations[0].id);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmedValue = numericValue.trim();
    if (trimmedValue && Number.isNaN(Number(trimmedValue))) {
      toast({
        title: "Value must be a number",
        description: "Leave it blank for coded findings.",
        variant: "error",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await createOhExamFinding({
        examination: Number(examinationId),
        code: code.trim(),
        numeric_value: trimmedValue || null,
        unit: unit.trim(),
        recorded_at: new Date().toISOString(),
        threshold_flag: "none",
      });
      setCode("");
      setNumericValue("");
      toast({ variant: "success", title: "Finding recorded" });
      onCreated();
      codeInputRef.current?.focus();
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
    <OhPanelSection description="Audiometry, spirometry, vision, and other measured results. The unit is kept between entries.">
      <form
        onSubmit={(event) => void handleSubmit(event)}
        onKeyDown={submitOnModEnter}
        className="space-y-4"
        data-testid="oh-finding-form"
      >
        <div className="space-y-1.5">
          <Label htmlFor="oh-finding-exam">
            Examination <RequiredFieldMarker />
          </Label>
          <Select value={examinationId} onValueChange={setPickedExaminationId}>
            <SelectTrigger id="oh-finding-exam" className="w-full">
              <SelectValue placeholder="Select examination" />
            </SelectTrigger>
            <SelectContent className={appFont.className}>
              {sortedExaminations.map((exam) => (
                <SelectItem key={exam.uuid} value={String(exam.id)}>
                  {examOptionLabel(exam)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="oh-finding-code">
            Code <RequiredFieldMarker />
          </Label>
          <Input
            ref={codeInputRef}
            id="oh-finding-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="e.g. FEV1, HEARING_L_4K"
            required
          />
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="oh-finding-value">Value</Label>
            <Input
              id="oh-finding-value"
              inputMode="decimal"
              value={numericValue}
              onChange={(event) => setNumericValue(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="oh-finding-unit">Unit</Label>
            <Input
              id="oh-finding-unit"
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
              placeholder="dB"
            />
          </div>
        </div>
        <OhFormFooter>
          <PrimaryButton type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Add finding"}
          </PrimaryButton>
        </OhFormFooter>
      </form>
    </OhPanelSection>
  );
}

type OhFindingRecordsProps = {
  examinations: OhExamination[];
  findings: OhExamFinding[];
};

export function OhFindingRecords({ examinations, findings }: OhFindingRecordsProps) {
  if (findings.length === 0) {
    return (
      <OhRecordsEmpty
        icon={Activity}
        title="No findings yet"
        description={
          examinations.length === 0
            ? "Record an examination first, then capture its measured results here."
            : "Add measured results on the left. They are grouped by examination."
        }
        data-testid="oh-finding-records-empty"
      />
    );
  }

  const findingsByExam = new Map<number, OhExamFinding[]>();
  for (const finding of newestFirst(findings, (item) => item.recorded_at)) {
    const group = findingsByExam.get(finding.examination) ?? [];
    group.push(finding);
    findingsByExam.set(finding.examination, group);
  }
  const groups = newestFirst(
    examinations,
    (exam) => exam.examined_at ?? exam.created_at,
  ).flatMap((exam) => {
    const items = findingsByExam.get(exam.id);
    return items ? [{ exam, items }] : [];
  });

  return (
    <>
      {groups.map(({ exam, items }) => (
        <OhPanelSection
          key={exam.uuid}
          title={examOptionLabel(exam)}
          data-testid="oh-finding-records"
        >
          <OhRecordList>
            {items.map((finding) => (
              <OhFindingRow key={finding.uuid} finding={finding} />
            ))}
          </OhRecordList>
        </OhPanelSection>
      ))}
    </>
  );
}

function OhFindingRow({ finding }: { finding: OhExamFinding }) {
  const isFlagged = Boolean(finding.threshold_flag) && finding.threshold_flag !== "none";

  return (
    <OhRecordItem
      title={finding.code}
      badges={isFlagged ? <OhStatusChip value={finding.threshold_flag} /> : null}
      meta={formatOhDate(finding.recorded_at)}
      action={
        finding.numeric_value ? (
          <span className="text-sm font-semibold tabular-nums text-brand-navy">
            {finding.numeric_value}
            {finding.unit ? (
              <span className="ml-1 text-xs font-normal text-brand-muted">
                {finding.unit}
              </span>
            ) : null}
          </span>
        ) : finding.coded_value ? (
          <span className="text-sm text-brand-slate">{finding.coded_value}</span>
        ) : null
      }
    />
  );
}

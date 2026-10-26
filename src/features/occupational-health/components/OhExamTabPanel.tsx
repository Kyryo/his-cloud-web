"use client";

import { useState } from "react";

import { PrimaryButton } from "@/components/ui/app-buttons";
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
import { Stethoscope } from "lucide-react";

import {
  OhFormFooter,
  OhPanelSection,
  OhRecordItem,
  OhRecordList,
  OhRecordsEmpty,
  submitOnModEnter,
} from "@/features/occupational-health/components/OhEncounterColumns";
import { OhStatusChip } from "@/features/occupational-health/components/OhStatusChip";
import type {
  FitnessAssessment,
  OhExamFinding,
  OhExamination,
} from "@/features/occupational-health/types";
import { createOhExamination } from "@/features/occupational-health/services/oh.service";
import {
  formatOhDate,
  newestFirst,
} from "@/features/occupational-health/utils/oh-format";
import {
  EXAM_TYPES,
  formatExamTypeLabel,
  formatFitnessOutcome,
} from "@/features/occupational-health/utils/oh-labels";
import { appFont } from "@/lib/fonts";
import { useToast } from "@/providers/toast-provider";

type OhExamFormProps = {
  encounterId: number;
  onCreated: () => void;
};

export function OhExamForm({ encounterId, onCreated }: OhExamFormProps) {
  const { toast } = useToast();
  const [examType, setExamType] = useState<string>("periodic");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await createOhExamination({
        encounter: encounterId,
        exam_type: examType,
        occupational_attendance: true,
        notes: notes.trim(),
      });
      setNotes("");
      toast({ variant: "success", title: "Examination recorded" });
      onCreated();
    } catch (error) {
      toast({
        title: "Could not save examination",
        description: error instanceof Error ? error.message : undefined,
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <OhPanelSection description="Each examination anchors the fitness assessment and findings recorded against it.">
      <form
        onSubmit={(event) => void handleSubmit(event)}
        onKeyDown={submitOnModEnter}
        className="space-y-4"
        data-testid="oh-exam-form"
      >
        <div className="space-y-1.5">
          <Label htmlFor="oh-exam-type">
            Exam type <RequiredFieldMarker />
          </Label>
          <Select value={examType} onValueChange={setExamType}>
            <SelectTrigger id="oh-exam-type" className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className={appFont.className}>
              {EXAM_TYPES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="oh-exam-notes">Notes</Label>
          <Textarea
            id="oh-exam-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            placeholder="Reason for attendance, history, observations"
          />
        </div>
        <OhFormFooter>
          <PrimaryButton type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Add examination"}
          </PrimaryButton>
        </OhFormFooter>
      </form>
    </OhPanelSection>
  );
}

type OhExamRecordsProps = {
  examinations: OhExamination[];
  findings: OhExamFinding[];
  assessments: FitnessAssessment[];
};

export function OhExamRecords({
  examinations,
  findings,
  assessments,
}: OhExamRecordsProps) {
  if (examinations.length === 0) {
    return (
      <OhRecordsEmpty
        icon={Stethoscope}
        title="No examinations yet"
        description="Record the examination on the left. Findings and the fitness decision are recorded against it."
        data-testid="oh-exam-records-empty"
      />
    );
  }

  const findingCounts = new Map<number, number>();
  for (const finding of findings) {
    findingCounts.set(
      finding.examination,
      (findingCounts.get(finding.examination) ?? 0) + 1,
    );
  }
  const latestOutcomeByExam = new Map<number, string>();
  for (const assessment of newestFirst(assessments, (item) => item.assessed_at)) {
    if (!latestOutcomeByExam.has(assessment.examination)) {
      latestOutcomeByExam.set(assessment.examination, assessment.outcome);
    }
  }
  const sortedExaminations = newestFirst(
    examinations,
    (exam) => exam.examined_at ?? exam.created_at,
  );

  return (
    <OhPanelSection>
      <OhRecordList data-testid="oh-exam-records">
        {sortedExaminations.map((exam) => {
          const findingCount = findingCounts.get(exam.id) ?? 0;
          const outcome = latestOutcomeByExam.get(exam.id);

          return (
            <OhRecordItem
              key={exam.uuid}
              title={formatExamTypeLabel(exam.exam_type)}
              badges={
                outcome ? (
                  <OhStatusChip value={outcome} label={formatFitnessOutcome(outcome)} />
                ) : (
                  <OhStatusChip value="pending" label="No fitness decision" />
                )
              }
              meta={[
                formatOhDate(exam.examined_at ?? exam.created_at),
                findingCount === 1 ? "1 finding" : `${findingCount} findings`,
              ].join(" · ")}
            >
              {exam.notes || null}
            </OhRecordItem>
          );
        })}
      </OhRecordList>
    </OhPanelSection>
  );
}

"use client";

import { ClipboardList } from "lucide-react";
import { useState } from "react";

import { DetailTabEmptyState } from "@/components/detail/detail-tab-empty-state";
import { Button } from "@/components/ui/button";
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
import { createOhExamination } from "@/features/occupational-health/services/oh.service";
import type { OhExamination } from "@/features/occupational-health/types";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import { useToast } from "@/providers/toast-provider";

const EXAM_TYPES = [
  { value: "pre_employment", label: "Pre-employment" },
  { value: "periodic", label: "Periodic" },
  { value: "transfer", label: "Transfer" },
  { value: "rtw", label: "Return to work" },
  { value: "post_incident", label: "Post-incident" },
  { value: "exit", label: "Exit" },
] as const;

type OhExamTabPanelProps = {
  visitUuid: string;
  encounterUuid: string;
  encounterId: number;
  examinations: OhExamination[];
  onCreated: () => void;
};

export function OhExamTabPanel({
  visitUuid,
  encounterUuid,
  encounterId,
  examinations,
  onCreated,
}: OhExamTabPanelProps) {
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
        notes,
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
    <OhConsultLayout
      visitUuid={visitUuid}
      encounterUuid={encounterUuid}
      historySection="exam"
      data-testid="oh-exam-tab"
      form={
        <OhConsultFormPanel
          title="Examination"
          description="Record the exam type and any clinical notes for this visit."
        >
          <form
            onSubmit={(event) => void handleSubmit(event)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="oh-exam-type">Exam type</Label>
              <Select value={examType} onValueChange={setExamType}>
                <SelectTrigger id="oh-exam-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {EXAM_TYPES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="oh-exam-notes">Notes</Label>
              <Textarea
                id="oh-exam-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                placeholder="Optional notes for this examination"
              />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Saving…" : "Add examination"}
            </Button>
          </form>
        </OhConsultFormPanel>
      }
      content={
        <OhConsultContentPanel title="Examinations" count={examinations.length}>
          {examinations.length === 0 ? (
            <DetailTabEmptyState
              icon={ClipboardList}
              title="No examinations yet"
              description="Save an examination on the left. It will appear here for this visit."
            />
          ) : (
            <ul className="space-y-3">
              {examinations.map((exam) => (
                <li key={exam.uuid}>
                  <OhRecordCard
                    title={
                      <span className="capitalize">
                        {exam.exam_type.replace(/_/g, " ")}
                      </span>
                    }
                    meta={
                      exam.examined_at
                        ? formatDisplayDateTime(exam.examined_at)
                        : undefined
                    }
                  >
                    {exam.notes ? (
                      <p className="text-sm leading-relaxed text-brand-slate">
                        {exam.notes}
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

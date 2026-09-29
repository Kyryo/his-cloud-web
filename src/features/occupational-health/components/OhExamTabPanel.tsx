"use client";

import { useState } from "react";

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
import type { OhExamination } from "@/features/occupational-health/types";
import { createOhExamination } from "@/features/occupational-health/services/oh.service";
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
  encounterId: number;
  examinations: OhExamination[];
  onCreated: () => void;
};

export function OhExamTabPanel({
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
    <div className="space-y-6" data-testid="oh-exam-tab">
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="grid gap-4 rounded-xl border border-brand-border bg-white p-4 md:grid-cols-2"
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
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="oh-exam-notes">Notes</Label>
          <Textarea
            id="oh-exam-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
          />
        </div>
        <div className="md:col-span-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Add examination"}
          </Button>
        </div>
      </form>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-brand-navy">Examinations</h3>
        {examinations.length === 0 ? (
          <p className="text-sm text-brand-muted">No examinations yet.</p>
        ) : (
          <ul className="divide-y rounded-xl border border-brand-border bg-white">
            {examinations.map((exam) => (
              <li key={exam.uuid} className="px-4 py-3 text-sm">
                <div className="font-medium capitalize">
                  {exam.exam_type.replace(/_/g, " ")}
                </div>
                {exam.notes ? (
                  <p className="mt-1 text-brand-muted">{exam.notes}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

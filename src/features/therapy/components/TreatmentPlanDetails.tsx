"use client";

import { useState } from "react";

import { SpinnerGlyph } from "@/components/loading-spinner";
import {
  DestructiveButton,
  SecondaryButton,
} from "@/components/ui/app-buttons";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { dischargeTherapyVisitTreatmentPlan } from "@/features/therapy/services/therapy.service";
import type {
  TherapyDiscipline,
  TherapyTreatmentPlan,
} from "@/features/therapy/types/therapy.types";
import { useToast } from "@/providers/toast-provider";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-MW", { dateStyle: "medium" });

function displayDate(value: string | null): string {
  if (!value) return "Not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not set" : DATE_FORMATTER.format(date);
}

export function TreatmentPlanDetails({
  plan,
  discipline,
  visitUuid,
  isReadOnly,
  onChanged,
}: {
  plan: TherapyTreatmentPlan;
  discipline: TherapyDiscipline;
  visitUuid: string;
  isReadOnly: boolean;
  onChanged: () => Promise<void>;
}) {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dischargeSummary, setDischargeSummary] = useState("");
  const [isDischarging, setIsDischarging] = useState(false);
  const isDischarged =
    plan.status === "completed" || plan.status === "discontinued";
  const details = [
    ["Diagnosis", plan.diagnosis],
    ["Diagnosis code", plan.diagnosis_code || "Not set"],
    ["Status", plan.status.replaceAll("_", " ")],
    ["Sessions planned", String(plan.total_sessions_planned)],
    ["Sessions completed", String(plan.sessions_completed)],
    ["Start date", displayDate(plan.start_date)],
    ["Expected end date", displayDate(plan.expected_end_date)],
    ["Actual end date", displayDate(plan.actual_end_date)],
    ["Discharge summary", plan.discharge_summary || "Not set"],
  ] as const;

  async function dischargePlan() {
    setIsDischarging(true);
    try {
      await dischargeTherapyVisitTreatmentPlan(
        discipline,
        visitUuid,
        dischargeSummary.trim(),
      );
      await onChanged();
      setDialogOpen(false);
      toast({
        variant: "success",
        title: "Treatment discharged",
        description: "The treatment plan is now read-only.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not discharge treatment",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    } finally {
      setIsDischarging(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-brand-border pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold text-brand-navy">{plan.title}</h2>
            <Badge variant="outline" className="capitalize">
              {plan.status.replaceAll("_", " ")}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-brand-muted">
            Treatment plan details
          </p>
        </div>
        {!isDischarged ? (
          <DestructiveButton
            type="button"
            disabled={isReadOnly}
            onClick={() => setDialogOpen(true)}
          >
            Discharge
          </DestructiveButton>
        ) : null}
      </div>
      <dl className="grid gap-x-8 gap-y-6 py-6 sm:grid-cols-2">
        {details.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-medium uppercase tracking-wide text-brand-muted">
              {label}
            </dt>
            <dd className="mt-1 text-sm capitalize text-brand-slate">{value}</dd>
          </div>
        ))}
      </dl>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discharge treatment plan?</DialogTitle>
            <DialogDescription>
              Add the discharge summary. Discharging makes this plan and its
              visit therapy records read-only.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="discharge-summary">Discharge summary</Label>
            <Textarea
              id="discharge-summary"
              rows={5}
              value={dischargeSummary}
              onChange={(event) => setDischargeSummary(event.target.value)}
              placeholder="Document outcomes, remaining concerns, and recommendations..."
              disabled={isDischarging}
            />
          </div>
          <DialogFooter>
            <SecondaryButton
              type="button"
              disabled={isDischarging}
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </SecondaryButton>
            <DestructiveButton
              type="button"
              disabled={!dischargeSummary.trim() || isDischarging}
              onClick={() => void dischargePlan()}
            >
              {isDischarging ? <SpinnerGlyph size="xs" /> : null}
              Discharge
            </DestructiveButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

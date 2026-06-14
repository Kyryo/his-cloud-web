"use client";

import { CheckCircle2, ClipboardPlus } from "lucide-react";
import { useState } from "react";

import {
  AddActionButton,
  SecondaryButton,
} from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { DetailPageAsidePanelSection } from "@/features/app-shell/components/page-layout";
import { GoalProgressForm } from "@/features/therapy/components/GoalProgressForm";
import { TreatmentGoalForm } from "@/features/therapy/components/TreatmentGoalForm";
import type {
  TherapyDiscipline,
  TherapyTreatmentGoal,
  TherapyVisitTreatmentGoals,
} from "@/features/therapy/types/therapy.types";

type TreatmentGoalsPanelProps = {
  discipline: TherapyDiscipline;
  visitUuid: string;
  data: TherapyVisitTreatmentGoals;
  onChanged: () => Promise<void>;
  onRequestTreatmentPlan: () => void;
  isReadOnly: boolean;
};

function formatDecimal(value: string | number | null): string {
  if (value === null) return "0";
  const raw = String(value);
  if (!raw.includes(".")) return raw;
  return raw.replace(/(\.\d*?[1-9])0+$|\.0+$/, "$1");
}

function goalUnit(goal: TherapyTreatmentGoal): string {
  return goal.unit === "custom" ? goal.unit_custom_label : goal.unit;
}

export function TreatmentGoalsPanel({
  discipline,
  visitUuid,
  data,
  onChanged,
  onRequestTreatmentPlan,
  isReadOnly,
}: TreatmentGoalsPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [progressGoal, setProgressGoal] =
    useState<TherapyTreatmentGoal | null>(null);
  const [visibleNotes, setVisibleNotes] = useState<Set<string>>(new Set());

  function toggleNotes(goalUuid: string) {
    setVisibleNotes((current) => {
      const next = new Set(current);
      if (next.has(goalUuid)) next.delete(goalUuid);
      else next.add(goalUuid);
      return next;
    });
  }

  return (
    <DetailPageAsidePanelSection className="min-h-full px-0 py-0 xl:px-0">
      <div className="flex items-center justify-between gap-3 border-b border-brand-border px-4 py-4 sm:px-5">
        <div>
          <h2 className="text-base font-semibold text-brand-navy">
            Treatment Goals
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            {data.treatment_plan ? (
              <span className="text-brand-muted">
                {data.treatment_plan.title}
              </span>
            ) : null}
            <span className="font-medium text-emerald-700">
              {data.goals.filter((goal) => goal.is_achieved).length}/
              {data.goals.length} goals
            </span>
          </div>
        </div>
        <AddActionButton
          label="Add"
          size="sm"
          disabled={isReadOnly}
          onClick={() => {
            if (!data.treatment_plan) {
              onRequestTreatmentPlan();
              return;
            }
            setShowForm(true);
          }}
        />
      </div>

      {showForm && data.treatment_plan ? (
        <TreatmentGoalForm
          discipline={discipline}
          visitUuid={visitUuid}
          onCancel={() => setShowForm(false)}
          onCreated={onChanged}
        />
      ) : data.goals.length > 0 ? (
        <div className="divide-y divide-brand-border px-4 sm:px-5">
          {data.goals.map((goal) => (
            <div key={goal.uuid} className="py-4">
              <div className="flex min-w-0 items-start gap-2">
                {goal.is_achieved ? (
                  <CheckCircle2
                    className="mt-1 size-4 shrink-0 text-emerald-600"
                    aria-label="Goal achieved"
                  />
                ) : (
                  <SecondaryButton
                    type="button"
                    size="sm"
                    className="h-7 shrink-0 px-2 text-xs"
                    disabled={isReadOnly}
                    onClick={() => setProgressGoal(goal)}
                  >
                    + progress
                  </SecondaryButton>
                )}
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-sm font-medium text-brand-navy"
                    title={goal.description}
                  >
                    {goal.description}
                  </p>
                  {goal.unit === "boolean" ? (
                    <p className="mt-1 text-xs text-brand-muted">
                      Response:{" "}
                      {goal.boolean_value === null
                        ? "Not recorded"
                        : goal.boolean_value
                          ? "Yes"
                          : "No"}
                    </p>
                  ) : goal.target_value ? (
                    <p className="mt-1 truncate text-xs text-brand-muted">
                      Target: {formatDecimal(goal.target_value)} {goalUnit(goal)}
                    </p>
                  ) : null}
                  {goal.progress_percentage !== null ? (
                    <div className="mt-3">
                      <div className="mb-1.5 flex justify-between text-[11px] text-brand-muted">
                        <span>
                          {formatDecimal(goal.baseline_value)} start
                        </span>
                        <span>
                          {formatDecimal(
                            goal.current_value ?? goal.baseline_value,
                          )}{" "}
                          / {formatDecimal(goal.target_value)}
                        </span>
                      </div>
                      <Progress value={goal.progress_percentage} />
                    </div>
                  ) : null}
                  {goal.notes ? (
                    <div className="mt-2">
                      <button
                        type="button"
                        className="text-xs font-medium text-brand-primary hover:underline"
                        onClick={() => toggleNotes(goal.uuid)}
                      >
                        {visibleNotes.has(goal.uuid)
                          ? "Hide notes"
                          : "Show notes"}
                      </button>
                      {visibleNotes.has(goal.uuid) ? (
                        <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-brand-slate">
                          {goal.notes}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 py-10 text-center sm:px-5">
          <ClipboardPlus className="mx-auto size-6 text-brand-muted" />
          <p className="mt-2 text-sm font-medium text-brand-navy">
            No treatment goals yet
          </p>
          <p className="mt-1 text-xs text-brand-muted">
            {data.treatment_plan
              ? "Add the first measurable goal for this visit."
              : "Link a treatment plan before adding goals."}
          </p>
        </div>
      )}

      <Dialog
        open={Boolean(progressGoal)}
        onOpenChange={(open) => {
          if (!open) setProgressGoal(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record goal progress</DialogTitle>
            <DialogDescription>
              {progressGoal?.description}
            </DialogDescription>
          </DialogHeader>
          {progressGoal ? (
            <GoalProgressForm
              discipline={discipline}
              visitUuid={visitUuid}
              goal={progressGoal}
              onCancel={() => setProgressGoal(null)}
              onRecorded={onChanged}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </DetailPageAsidePanelSection>
  );
}

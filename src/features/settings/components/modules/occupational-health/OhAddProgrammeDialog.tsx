"use client";

import { useEffect, useState } from "react";

import {
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OhCatalogItemPicker } from "@/features/settings/components/modules/occupational-health/OhCatalogItemPicker";
import { cn } from "@/lib/utils";

export type OhAddProgrammeDraft = {
  name: string;
  code: string;
  examType: string;
  procedureCodes: string[];
  criticalCodes: string[];
};

type AddProgrammeStep = "details" | "exams" | "procedures" | "activities";

const STEPS: Array<{ id: AddProgrammeStep; label: string }> = [
  { id: "details", label: "Details" },
  { id: "exams", label: "Examinations" },
  { id: "procedures", label: "Procedures" },
  { id: "activities", label: "Critical activities" },
];

type OhAddProgrammeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting?: boolean;
  onSubmit: (draft: OhAddProgrammeDraft) => Promise<void> | void;
};

export function OhAddProgrammeDialog({
  open,
  onOpenChange,
  isSubmitting = false,
  onSubmit,
}: OhAddProgrammeDialogProps) {
  const [step, setStep] = useState<AddProgrammeStep>("details");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [examType, setExamType] = useState("");
  const [procedureCodes, setProcedureCodes] = useState<string[]>([]);
  const [criticalCodes, setCriticalCodes] = useState<string[]>([]);

  useEffect(() => {
    if (!open) {
      return;
    }
    setStep("details");
    setName("");
    setCode("");
    setExamType("");
    setProcedureCodes([]);
    setCriticalCodes([]);
  }, [open]);

  function canContinueFromDetails() {
    return Boolean(name.trim() && code.trim());
  }

  async function handleCreate() {
    if (!canContinueFromDetails()) {
      setStep("details");
      return;
    }
    await onSubmit({
      name: name.trim(),
      code: code.trim(),
      examType,
      procedureCodes,
      criticalCodes,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="space-y-1 border-b border-dash-border/70 px-6 py-5 text-left">
          <DialogTitle>Add programme</DialogTitle>
          <DialogDescription>
            Set programme details, then select catalog examinations, procedures,
            and critical activities required on exams.
          </DialogDescription>
        </DialogHeader>

        <nav
          aria-label="Add programme steps"
          className="flex gap-5 overflow-x-auto border-b border-dash-border/70 px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {STEPS.map((entry) => {
            const isActive = step === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => setStep(entry.id)}
                className={cn(
                  "relative -mb-px shrink-0 pb-2.5 pt-3 text-sm transition-colors",
                  isActive
                    ? "font-medium text-brand-navy"
                    : "text-dash-muted hover:text-brand-navy",
                )}
              >
                {entry.label}
                {isActive ? (
                  <span className="absolute inset-x-0 bottom-0 h-px bg-brand-navy" />
                ) : null}
              </button>
            );
          })}
        </nav>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {step === "details" ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="oh-programme-name">Name</Label>
                <Input
                  id="oh-programme-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oh-programme-code">Code</Label>
                <Input
                  id="oh-programme-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  required
                />
              </div>
            </div>
          ) : null}

          {step === "exams" ? (
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-brand-navy">
                  Examinations
                </h3>
                <p className="mt-0.5 text-[13px] text-slate-400">
                  Choose the exam type this programme covers. You can refine
                  matrix rows later.
                </p>
              </div>
              <OhCatalogItemPicker
                itemType="exam_type"
                selectedCodes={examType ? [examType] : []}
                onChange={(codes) => setExamType(codes[0] ?? "")}
                multi={false}
                emptyLabel="Add examination types under Catalog first."
                searchPlaceholder="Search examinations…"
              />
            </div>
          ) : null}

          {step === "procedures" ? (
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-brand-navy">
                  Medical procedures
                </h3>
                <p className="mt-0.5 text-[13px] text-slate-400">
                  Selected procedures become outstanding checklist items on the
                  exam.
                </p>
              </div>
              <OhCatalogItemPicker
                itemType="procedure"
                selectedCodes={procedureCodes}
                onChange={setProcedureCodes}
                emptyLabel="Add medical procedures under Catalog first."
                searchPlaceholder="Search procedures…"
              />
            </div>
          ) : null}

          {step === "activities" ? (
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-brand-navy">
                  Eligible critical activities
                </h3>
                <p className="mt-0.5 text-[13px] text-slate-400">
                  Selected activities are required on exams for this programme.
                </p>
              </div>
              <OhCatalogItemPicker
                itemType="critical_activity"
                selectedCodes={criticalCodes}
                onChange={setCriticalCodes}
                emptyLabel="Add critical activities under Catalog first."
                searchPlaceholder="Search critical activities…"
              />
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-dash-border/60 bg-white px-6 py-4">
          <p className="text-xs text-dash-muted">
            {[
              examType ? "1 exam" : null,
              procedureCodes.length
                ? `${procedureCodes.length} procedure${procedureCodes.length === 1 ? "" : "s"}`
                : null,
              criticalCodes.length
                ? `${criticalCodes.length} activit${criticalCodes.length === 1 ? "y" : "ies"}`
                : null,
            ]
              .filter(Boolean)
              .join(" · ") || "No catalog items selected yet"}
          </p>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <SecondaryButton
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </SecondaryButton>
            {step !== "details" ? (
              <SecondaryButton
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  const index = STEPS.findIndex((entry) => entry.id === step);
                  const previous = STEPS[index - 1];
                  if (previous) {
                    setStep(previous.id);
                  }
                }}
              >
                Back
              </SecondaryButton>
            ) : null}
            {step !== "activities" ? (
              <PrimaryButton
                type="button"
                disabled={isSubmitting || (step === "details" && !canContinueFromDetails())}
                onClick={() => {
                  if (step === "details" && !canContinueFromDetails()) {
                    return;
                  }
                  const index = STEPS.findIndex((entry) => entry.id === step);
                  const next = STEPS[index + 1];
                  if (next) {
                    setStep(next.id);
                  }
                }}
              >
                Continue
              </PrimaryButton>
            ) : (
              <PrimaryButton
                type="button"
                disabled={isSubmitting || !canContinueFromDetails()}
                onClick={() => void handleCreate()}
              >
                {isSubmitting ? "Saving…" : "Create and publish v1"}
              </PrimaryButton>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

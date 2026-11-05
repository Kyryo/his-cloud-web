"use client";

import { useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MEDICAL_EXAM_START_TYPES } from "@/features/occupational-health/utils/oh-labels";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export type MedicalExamStartType =
  (typeof MEDICAL_EXAM_START_TYPES)[number]["value"];

const EXAM_TYPE_HINTS: Record<MedicalExamStartType, string> = {
  pre_employment: "Before the person starts work",
  periodic: "Scheduled review during employment",
  transfer: "When the job or exposures change",
  rtw: "After absence or illness",
  exit: "When employment ends",
};

type OhExamTypeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (examType: MedicalExamStartType) => void;
  /** When true, dialog cannot be dismissed without choosing a type. */
  required?: boolean;
  initialExamType?: MedicalExamStartType | "";
};

export function OhExamTypeDialog({
  open,
  onOpenChange,
  onConfirm,
  required = false,
  initialExamType = "",
}: OhExamTypeDialogProps) {
  function handleOpenChange(next: boolean) {
    if (!next && required) {
      return;
    }
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        data-testid="oh-exam-type-dialog"
        className={cn(
          appFont.className,
          "max-w-md gap-0 p-0",
          required && "[&>button]:hidden",
        )}
        onPointerDownOutside={(event) => {
          if (required) {
            event.preventDefault();
          }
        }}
        onEscapeKeyDown={(event) => {
          if (required) {
            event.preventDefault();
          }
        }}
      >
        <DialogHeader className="px-5 pb-4 pt-5">
          <DialogTitle>Examination type</DialogTitle>
        </DialogHeader>
        {open ? (
          <ExamTypeChoices
            key={initialExamType || "unset"}
            initialExamType={initialExamType}
            required={required}
            onCancel={() => onOpenChange(false)}
            onConfirm={onConfirm}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ExamTypeChoices({
  initialExamType,
  required,
  onCancel,
  onConfirm,
}: {
  initialExamType: MedicalExamStartType | "";
  required: boolean;
  onCancel: () => void;
  onConfirm: (examType: MedicalExamStartType) => void;
}) {
  const [examType, setExamType] = useState<MedicalExamStartType | "">(initialExamType);

  function handleConfirm() {
    const selected = MEDICAL_EXAM_START_TYPES.find(
      (option) => option.value === examType,
    );
    if (!selected) {
      return;
    }
    onConfirm(selected.value);
  }

  return (
    <>
      <fieldset className="border-t border-dash-border">
        <legend className="sr-only">Examination type</legend>
        <div className="divide-y divide-dash-border">
          {MEDICAL_EXAM_START_TYPES.map((option) => {
            const selected = examType === option.value;
            return (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 px-5 py-3 has-[:focus-visible]:bg-slate-50",
                  selected ? "bg-brand-tint/70" : "hover:bg-slate-50",
                )}
              >
                <input
                  type="radio"
                  name="oh-medical-exam-type"
                  value={option.value}
                  checked={selected}
                  onChange={() => setExamType(option.value)}
                  className="sr-only"
                  data-testid={`oh-exam-type-option-${option.value}`}
                />
                <span
                  aria-hidden
                  className={cn(
                    "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                    selected ? "border-brand-primary" : "border-dash-border",
                  )}
                >
                  {selected ? (
                    <span className="size-2 rounded-full bg-brand-primary" />
                  ) : null}
                </span>
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-medium text-brand-navy">
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-dash-muted">
                    {EXAM_TYPE_HINTS[option.value]}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <DialogFooter className="mt-0 border-t border-dash-border px-5 py-3">
        {required ? null : (
          <SecondaryButton type="button" onClick={onCancel}>
            Cancel
          </SecondaryButton>
        )}
        <PrimaryButton
          type="button"
          disabled={!examType}
          onClick={handleConfirm}
          data-testid="oh-exam-type-confirm"
        >
          {required ? "Start examination" : "Use this type"}
        </PrimaryButton>
      </DialogFooter>
    </>
  );
}

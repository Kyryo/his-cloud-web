"use client";

import { useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MEDICAL_EXAM_START_TYPES } from "@/features/occupational-health/utils/oh-labels";
import { appFont } from "@/lib/fonts";

export type MedicalExamStartType =
  (typeof MEDICAL_EXAM_START_TYPES)[number]["value"];

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
  const [examType, setExamType] = useState<string>(initialExamType);

  function handleOpenChange(next: boolean) {
    if (!next && required) {
      return;
    }
    onOpenChange(next);
  }

  function handleConfirm() {
    if (!MEDICAL_EXAM_START_TYPES.some((option) => option.value === examType)) {
      return;
    }
    onConfirm(examType as MedicalExamStartType);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        data-testid="oh-exam-type-dialog"
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
        <DialogHeader>
          <DialogTitle>Select examination type</DialogTitle>
          <DialogDescription>
            Choose the type of medical examination for this encounter before
            capturing answers.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5 py-2">
          <Label htmlFor="oh-medical-exam-type">
            Exam type <RequiredFieldMarker />
          </Label>
          <Select value={examType} onValueChange={setExamType}>
            <SelectTrigger
              id="oh-medical-exam-type"
              className="w-full"
              data-testid="oh-exam-type-select"
            >
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className={appFont.className}>
              {MEDICAL_EXAM_START_TYPES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          {!required ? (
            <SecondaryButton type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </SecondaryButton>
          ) : null}
          <PrimaryButton
            type="button"
            disabled={!examType}
            onClick={handleConfirm}
            data-testid="oh-exam-type-confirm"
          >
            Continue
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

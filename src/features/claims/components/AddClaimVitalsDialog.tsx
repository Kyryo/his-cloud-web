"use client";

import { Loader2, Plus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { updateClaim } from "@/features/claims/services/claims.service";
import type {
  ClaimDetail,
  ClaimVitals,
} from "@/features/claims/types/claims.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

export type AddClaimVitalsDialogProps = {
  claim: ClaimDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (claim: ClaimDetail) => void | Promise<void>;
};

function fieldValue(value: number | string | null | undefined): string {
  if (value == null || value === "") {
    return "";
  }
  return String(value);
}

export function AddClaimVitalsDialog({
  claim,
  open,
  onOpenChange,
  onSuccess,
}: AddClaimVitalsDialogProps) {
  const { toast } = useToast();
  const existing = claim.vitals ?? {};
  const hasExisting =
    (existing.height != null && existing.height !== "") ||
    (existing.weight != null && existing.weight !== "") ||
    (existing.systolic_pressure != null &&
      existing.diastolic_pressure != null);

  const [height, setHeight] = useState(fieldValue(existing.height));
  const [weight, setWeight] = useState(fieldValue(existing.weight));
  const [systolic, setSystolic] = useState(
    fieldValue(existing.systolic_pressure),
  );
  const [diastolic, setDiastolic] = useState(
    fieldValue(existing.diastolic_pressure),
  );
  const [isSaving, setIsSaving] = useState(false);

  function resetFromClaim(nextClaim: ClaimDetail) {
    const vitals = nextClaim.vitals ?? {};
    setHeight(fieldValue(vitals.height));
    setWeight(fieldValue(vitals.weight));
    setSystolic(fieldValue(vitals.systolic_pressure));
    setDiastolic(fieldValue(vitals.diastolic_pressure));
  }

  async function handleSave() {
    const vitals: ClaimVitals = {
      ...existing,
    };

    const trimmedHeight = height.trim();
    const trimmedWeight = weight.trim();
    const trimmedSystolic = systolic.trim();
    const trimmedDiastolic = diastolic.trim();

    if (trimmedHeight) {
      vitals.height = trimmedHeight;
    } else {
      delete vitals.height;
    }
    if (trimmedWeight) {
      vitals.weight = trimmedWeight;
    } else {
      delete vitals.weight;
    }
    if (trimmedSystolic) {
      vitals.systolic_pressure = trimmedSystolic;
    } else {
      delete vitals.systolic_pressure;
    }
    if (trimmedDiastolic) {
      vitals.diastolic_pressure = trimmedDiastolic;
    } else {
      delete vitals.diastolic_pressure;
    }

    if (
      !vitals.height &&
      !vitals.weight &&
      !vitals.systolic_pressure &&
      !vitals.diastolic_pressure
    ) {
      toast({
        variant: "error",
        title: "Add at least one vital",
        description: "Enter height, weight, or blood pressure before saving.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateClaim(claim.id, { vitals });
      toast({
        variant: "success",
        title: hasExisting ? "Vital signs updated" : "Vital signs added",
        description: "Saved on this claim.",
      });
      await onSuccess?.(updated);
      onOpenChange(false);
    } catch (error) {
      const message =
        error instanceof BffError
          ? formatBffErrorMessage(error.message, error.errors)
          : error instanceof Error
            ? error.message
            : "Something went wrong.";
      toast({
        variant: "error",
        title: "Could not save vital signs",
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (nextOpen) {
          resetFromClaim(claim);
        }
      }}
    >
      <DialogContent
        className={cn(
          "flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg",
          appFont.className,
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <DialogHeader className="border-b border-brand-border px-6 py-5">
            <DialogTitle>
              {hasExisting ? "Edit vital signs" : "Add vital signs"}
            </DialogTitle>
            <DialogDescription>
              Record height, weight, and blood pressure for this claim.
            </DialogDescription>
          </DialogHeader>

          {open ? (
            <>
              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="claim-vital-height"
                      className="text-sm font-medium text-brand-navy"
                    >
                      Height
                    </label>
                    <Input
                      id="claim-vital-height"
                      value={height}
                      onChange={(event) => setHeight(event.target.value)}
                      placeholder="e.g. 1.70 or 170"
                      className="mt-1.5"
                      inputMode="decimal"
                      autoComplete="off"
                    />
                    <p className="mt-1 text-xs text-brand-muted">
                      Meters or centimeters
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor="claim-vital-weight"
                      className="text-sm font-medium text-brand-navy"
                    >
                      Weight
                    </label>
                    <Input
                      id="claim-vital-weight"
                      value={weight}
                      onChange={(event) => setWeight(event.target.value)}
                      placeholder="e.g. 68"
                      className="mt-1.5"
                      inputMode="decimal"
                      autoComplete="off"
                    />
                    <p className="mt-1 text-xs text-brand-muted">Kilograms</p>
                  </div>
                  <div>
                    <label
                      htmlFor="claim-vital-systolic"
                      className="text-sm font-medium text-brand-navy"
                    >
                      Systolic BP
                    </label>
                    <Input
                      id="claim-vital-systolic"
                      value={systolic}
                      onChange={(event) => setSystolic(event.target.value)}
                      placeholder="e.g. 120"
                      className="mt-1.5"
                      inputMode="numeric"
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="claim-vital-diastolic"
                      className="text-sm font-medium text-brand-navy"
                    >
                      Diastolic BP
                    </label>
                    <Input
                      id="claim-vital-diastolic"
                      value={diastolic}
                      onChange={(event) => setDiastolic(event.target.value)}
                      placeholder="e.g. 80"
                      className="mt-1.5"
                      inputMode="numeric"
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-0 border-t border-brand-border px-6 py-5">
                <SecondaryButton
                  type="button"
                  onClick={() => onOpenChange(false)}
                  disabled={isSaving}
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton
                  type="button"
                  disabled={isSaving}
                  onClick={() => void handleSave()}
                  data-testid="claim-save-vitals-button"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus className="size-4" aria-hidden="true" />
                      {hasExisting ? "Save vital signs" : "Add vital signs"}
                    </>
                  )}
                </PrimaryButton>
              </DialogFooter>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

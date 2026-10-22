"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ToothSurface } from "@/features/clinical-dental/types/clinical-dental.types";
import { TOOTH_SURFACES } from "@/features/clinical-dental/utils/dental-conditions";
import { cn } from "@/lib/utils";

type DentalTreatmentSurfacesDialogProps = {
  open: boolean;
  surfaces: ToothSurface[];
  isSaving?: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (surfaces: ToothSurface[]) => void;
};

export function DentalTreatmentSurfacesDialog({
  open,
  surfaces,
  isSaving = false,
  onOpenChange,
  onSave,
}: DentalTreatmentSurfacesDialogProps) {
  const [value, setValue] = useState<ToothSurface[]>(surfaces);

  useEffect(() => {
    if (open) {
      setValue(surfaces);
    }
  }, [open, surfaces]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        data-testid="dental-treatment-surfaces-dialog"
      >
        <DialogHeader>
          <DialogTitle>Edit surfaces</DialogTitle>
          <DialogDescription>
            Choose the tooth surfaces treated for this procedure.
          </DialogDescription>
        </DialogHeader>
        <div
          className="flex flex-wrap gap-1.5"
          role="group"
          aria-label="Surfaces"
        >
          {TOOTH_SURFACES.map((surface) => {
            const checked = value.includes(surface.value);
            return (
              <label
                key={surface.value}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs",
                  checked
                    ? "border-brand-primary bg-brand-primary/10 text-brand-navy"
                    : "border-dash-border text-brand-slate",
                )}
              >
                <input
                  type="checkbox"
                  className="size-3.5 rounded border-brand-border"
                  checked={checked}
                  onChange={(event) => {
                    const next: ToothSurface[] = event.target.checked
                      ? [...value, surface.value]
                      : value.filter((item) => item !== surface.value);
                    setValue(next);
                  }}
                />
                {surface.label}
              </label>
            );
          })}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => onSave(value)}
            disabled={isSaving}
            data-testid="dental-treatment-surfaces-save"
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

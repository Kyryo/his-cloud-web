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
import { ClaimLineOdontogramPicker } from "@/features/dental/components/ClaimLineOdontogramPicker";

type DentalTreatmentTeethDialogProps = {
  open: boolean;
  toothNumbers: number[];
  isSaving?: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (toothNumbers: number[]) => void;
};

function sortedUnique(teeth: readonly number[]): number[] {
  return [...new Set(teeth)].sort((a, b) => a - b);
}

export function DentalTreatmentTeethDialog({
  open,
  toothNumbers,
  isSaving = false,
  onOpenChange,
  onSave,
}: DentalTreatmentTeethDialogProps) {
  const [value, setValue] = useState(toothNumbers);
  const [remountToken, setRemountToken] = useState(0);

  useEffect(() => {
    if (open) {
      setValue(toothNumbers);
      setRemountToken((token) => token + 1);
    }
  }, [open, toothNumbers]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-xl"
        data-testid="dental-treatment-teeth-dialog"
      >
        <DialogHeader>
          <DialogTitle>Edit teeth</DialogTitle>
          <DialogDescription>
            Select the teeth treated for this procedure.
          </DialogDescription>
        </DialogHeader>
        <ClaimLineOdontogramPicker
          value={value}
          remountToken={remountToken}
          instruction="Click the teeth treated"
          onRequestAssign={(teeth) =>
            setValue(sortedUnique([...value, ...teeth]))
          }
          onRemoveTeeth={(teeth) =>
            setValue(value.filter((tooth) => !teeth.includes(tooth)))
          }
          onSelectAll={(teeth) => setValue(sortedUnique([...value, ...teeth]))}
          onDeselectAll={(teeth) =>
            setValue(value.filter((tooth) => !teeth.includes(tooth)))
          }
        />
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
            data-testid="dental-treatment-teeth-save"
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

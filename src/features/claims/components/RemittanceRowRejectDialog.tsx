"use client";

import { Loader2 } from "lucide-react";

import {
  DestructiveButton,
  SecondaryButton,
} from "@/components/ui/app-buttons";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import type { RemittanceRow } from "@/features/claims/types/remittances.types";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type RemittanceRowRejectDialogProps = {
  row: RemittanceRow | null;
  open: boolean;
  isSubmitting?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
};

function formatRowLabel(row: RemittanceRow): string {
  const patient = row.patient_name || row.member_name;
  if (patient) {
    return patient;
  }
  if (row.procedure_code) {
    return row.procedure_code;
  }
  return `Row ${row.source_row_number}`;
}

export function RemittanceRowRejectDialog({
  row,
  open,
  isSubmitting = false,
  onOpenChange,
  onConfirm,
}: RemittanceRowRejectDialogProps) {
  const label = row ? formatRowLabel(row) : "this line";

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen && isSubmitting) {
      return;
    }
    onOpenChange(nextOpen);
  }

  return (
    <SectionedDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Reject remittance line?"
      className={cn("sm:max-w-md", appFont.className)}
      footer={
        <>
          <SecondaryButton
            type="button"
            disabled={isSubmitting}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          <DestructiveButton
            type="button"
            disabled={isSubmitting}
            onClick={() => void onConfirm()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rejecting…
              </>
            ) : (
              "Reject line"
            )}
          </DestructiveButton>
        </>
      }
    >
      <p className="text-sm text-brand-muted">
        Reject {label}. This line will not be applied to a claim and will be marked
        as rejected.
      </p>
    </SectionedDialog>
  );
}

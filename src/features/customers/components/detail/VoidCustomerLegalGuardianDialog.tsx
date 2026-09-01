"use client";

import { Loader2 } from "lucide-react";

import { DestructiveButton, SecondaryButton } from "@/components/ui/app-buttons";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import type { CustomerLegalGuardian } from "@/features/customers/types/customer-legal-guardian.types";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type VoidCustomerLegalGuardianDialogProps = {
  guardian: CustomerLegalGuardian | null;
  open: boolean;
  isVoiding: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function VoidCustomerLegalGuardianDialog({
  guardian,
  open,
  isVoiding,
  onOpenChange,
  onConfirm,
}: VoidCustomerLegalGuardianDialogProps) {
  if (!guardian) {
    return null;
  }

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Void legal guardian?"
      description={`This will inactivate ${guardian.full_name} as a legal guardian for this client. The record is kept, but it will no longer appear in the active list.`}
      className={cn("sm:max-w-md", appFont.className)}
      data-testid="void-customer-legal-guardian-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            disabled={isVoiding}
            onClick={() => onOpenChange(false)}
          >
            Keep active
          </SecondaryButton>
          <DestructiveButton
            type="button"
            disabled={isVoiding}
            onClick={onConfirm}
            data-testid="void-customer-legal-guardian-confirm"
          >
            {isVoiding ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Voiding...
              </>
            ) : (
              "Void guardian"
            )}
          </DestructiveButton>
        </>
      }
    >
      <p className="text-sm text-brand-slate">
        You can add a new legal guardian later if needed.
      </p>
    </SectionedDialog>
  );
}

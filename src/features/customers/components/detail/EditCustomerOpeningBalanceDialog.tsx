"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

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
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type EditCustomerOpeningBalanceDialogProps = {
  open: boolean;
  isSaving?: boolean;
  canEdit: boolean;
  initialOpeningBalance: number | string;
  onOpenChange: (open: boolean) => void;
  onSave: (openingBalance: string) => Promise<boolean> | boolean;
};

function parseAmount(value: string): number {
  if (!value.trim()) {
    return Number.NaN;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function EditCustomerOpeningBalanceDialog({
  open,
  isSaving = false,
  canEdit,
  initialOpeningBalance,
  onOpenChange,
  onSave,
}: EditCustomerOpeningBalanceDialogProps) {
  const [openingBalance, setOpeningBalance] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }
    const amount = Number(initialOpeningBalance);
    setOpeningBalance(Number.isFinite(amount) ? amount.toFixed(2) : "0.00");
  }, [initialOpeningBalance, open]);

  const parsed = parseAmount(openingBalance);
  const canSave = canEdit && !isSaving && Number.isFinite(parsed);

  async function handleSave() {
    if (!canSave) {
      return;
    }
    const saved = await onSave(parsed.toFixed(2));
    if (saved) {
      onOpenChange(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isSaving) {
          return;
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className={cn("sm:max-w-md", appFont.className)}>
        <DialogHeader>
          <DialogTitle>Edit opening balance</DialogTitle>
          <DialogDescription>
            Positive amounts mean the client owes the organization. Negative
            amounts are credits owed to the client.
          </DialogDescription>
        </DialogHeader>

        {canEdit ? (
          <div className="space-y-2">
            <label
              htmlFor="customer-opening-balance-input"
              className="text-sm font-medium text-brand-navy"
            >
              Opening balance
            </label>
            <Input
              id="customer-opening-balance-input"
              type="number"
              step="0.01"
              value={openingBalance}
              disabled={isSaving}
              onChange={(event) => setOpeningBalance(event.target.value)}
              data-testid="customer-opening-balance-input"
            />
            <p className="text-xs text-brand-muted">
              Outstanding balance is recalculated as opening balance + invoices −
              payments.
            </p>
          </div>
        ) : (
          <div
            className="rounded-xl border border-brand-border bg-white px-4 py-8 text-center"
            data-testid="customer-opening-balance-access-denied"
          >
            <p className="text-sm font-semibold text-brand-navy">Access denied</p>
            <p className="mt-2 text-sm text-brand-muted">
              Only users in the Billing group can edit opening balances. Contact
              your administrator if you need access.
            </p>
          </div>
        )}

        <DialogFooter>
          <SecondaryButton
            type="button"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
          >
            {canEdit ? "Cancel" : "Close"}
          </SecondaryButton>
          {canEdit ? (
            <PrimaryButton
              type="button"
              disabled={!canSave}
              onClick={() => void handleSave()}
              data-testid="customer-opening-balance-save-button"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </PrimaryButton>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

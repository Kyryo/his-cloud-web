"use client";

import { Loader2 } from "lucide-react";
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

function formatInitialBalance(value: number | string): string {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
}

export function EditCustomerOpeningBalanceDialog({
  open,
  isSaving = false,
  canEdit,
  initialOpeningBalance,
  onOpenChange,
  onSave,
}: EditCustomerOpeningBalanceDialogProps) {
  const [openingBalance, setOpeningBalance] = useState(() =>
    formatInitialBalance(initialOpeningBalance),
  );
  const [lastInitialBalance, setLastInitialBalance] = useState(
    initialOpeningBalance,
  );

  if (initialOpeningBalance !== lastInitialBalance) {
    setLastInitialBalance(initialOpeningBalance);
    setOpeningBalance(formatInitialBalance(initialOpeningBalance));
  }

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
        if (!isSaving) {
          if (nextOpen) {
            setOpeningBalance(formatInitialBalance(initialOpeningBalance));
          }
          onOpenChange(nextOpen);
        }
      }}
    >
      <DialogContent
        className={cn("sm:max-w-md", appFont.className)}
        data-testid="edit-customer-opening-balance-dialog"
      >
        <DialogHeader>
          <DialogTitle>Edit opening balance</DialogTitle>
          <DialogDescription>
            Set the starting balance carried over for this client. Outstanding
            balance will be recalculated automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label
              htmlFor="opening-balance-input"
              className="text-xs font-medium text-brand-navy"
            >
              Opening balance (MWK)
            </label>
            <Input
              id="opening-balance-input"
              type="number"
              step="0.01"
              value={openingBalance}
              disabled={!canEdit || isSaving}
              onChange={(e) => setOpeningBalance(e.target.value)}
              placeholder="0.00"
              data-testid="opening-balance-input"
            />
            <p className="text-xs text-brand-muted">
              Use positive values for client debt carried forward.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <SecondaryButton
            type="button"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
            data-testid="edit-opening-balance-cancel-button"
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            disabled={!canSave}
            onClick={() => void handleSave()}
            data-testid="edit-opening-balance-save-button"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

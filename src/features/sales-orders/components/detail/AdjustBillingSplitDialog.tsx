"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
import { StatusBanner } from "@/components/ui/status-banner";
import { formatSalesOrderAmount } from "@/features/sales-orders/utils/format-sales-order";
import {
  formatSplitMismatchDirection,
  SPLIT_ROUNDING_TOLERANCE,
} from "@/features/sales-orders/utils/sales-order-line-split-mismatch";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type AdjustBillingSplitDialogProps = {
  open: boolean;
  isSaving?: boolean;
  orderTotal: number;
  initialClientDue: number;
  initialInsurerDue: number;
  insurerLabel?: string;
  onOpenChange: (open: boolean) => void;
  onSave: (values: {
    client_due: string;
    insurer_due: string;
  }) => Promise<boolean> | boolean;
};

function parseAmount(value: string): number {
  if (!value.trim()) {
    return Number.NaN;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function amountsReconcile(left: number, right: number): boolean {
  return Math.abs(left - right) <= SPLIT_ROUNDING_TOLERANCE;
}

export function AdjustBillingSplitDialog({
  open,
  isSaving = false,
  orderTotal,
  initialClientDue,
  initialInsurerDue,
  insurerLabel = "Payer due",
  onOpenChange,
  onSave,
}: AdjustBillingSplitDialogProps) {
  const [clientDue, setClientDue] = useState("");
  const [insurerDue, setInsurerDue] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }
    setClientDue(initialClientDue.toFixed(2));
    setInsurerDue(initialInsurerDue.toFixed(2));
  }, [initialClientDue, initialInsurerDue, open]);

  const parsedClientDue = parseAmount(clientDue);
  const parsedInsurerDue = parseAmount(insurerDue);
  const splitTotal =
    Number.isFinite(parsedClientDue) && Number.isFinite(parsedInsurerDue)
      ? parsedClientDue + parsedInsurerDue
      : Number.NaN;
  const mismatch = useMemo(() => {
    if (!Number.isFinite(splitTotal)) {
      return {
        splitTotal: 0,
        delta: -orderTotal,
      };
    }
    if (amountsReconcile(splitTotal, orderTotal)) {
      return null;
    }
    return {
      splitTotal,
      delta: splitTotal - orderTotal,
    };
  }, [orderTotal, splitTotal]);

  const canSave = !mismatch && !isSaving && Number.isFinite(splitTotal);

  async function handleSave() {
    if (!canSave || mismatch) {
      return;
    }

    const saved = await onSave({
      client_due: parsedClientDue.toFixed(2),
      insurer_due: parsedInsurerDue.toFixed(2),
    });
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
          <DialogTitle>Edit billing summary</DialogTitle>
          <DialogDescription>
            Adjust how the order total is split between the payer and the client.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="adjust-billing-split-insurer-due"
                className="text-sm font-medium text-brand-navy"
              >
                {insurerLabel}
              </label>
              <Input
                id="adjust-billing-split-insurer-due"
                type="number"
                min="0"
                step="0.01"
                value={insurerDue}
                disabled={isSaving}
                onChange={(event) => setInsurerDue(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="adjust-billing-split-client-due"
                className="text-sm font-medium text-brand-navy"
              >
                Client due
              </label>
              <Input
                id="adjust-billing-split-client-due"
                type="number"
                min="0"
                step="0.01"
                value={clientDue}
                disabled={isSaving}
                onChange={(event) => setClientDue(event.target.value)}
              />
            </div>
          </div>

          <div className="rounded-lg border border-brand-border bg-slate-50/80 px-4 py-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-brand-muted">Order total</span>
              <span className="font-medium text-brand-navy">
                {formatSalesOrderAmount(orderTotal)}
              </span>
            </div>
            {mismatch ? (
              <div className="mt-2 flex items-center justify-between gap-4 border-t border-brand-border pt-2">
                <span className="text-brand-muted">Difference</span>
                <span className="font-medium text-brand-navy">
                  {formatSalesOrderAmount(Math.abs(mismatch.delta))} (
                  {formatSplitMismatchDirection(mismatch.delta)})
                </span>
              </div>
            ) : null}
          </div>

          {mismatch ? (
            <StatusBanner
              variant="error"
              message={`Payer + Client (${formatSalesOrderAmount(mismatch.splitTotal)}) does not match order total (${formatSalesOrderAmount(orderTotal)}). Difference: ${formatSalesOrderAmount(Math.abs(mismatch.delta))} (${formatSplitMismatchDirection(mismatch.delta)}).`}
            />
          ) : null}
        </div>

        <DialogFooter>
          <SecondaryButton
            type="button"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            disabled={!canSave}
            onClick={() => void handleSave()}
            data-testid="adjust-billing-split-save-button"
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

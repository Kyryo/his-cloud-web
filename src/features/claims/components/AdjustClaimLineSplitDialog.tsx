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
import type { ClaimLineItem } from "@/features/claims/types/claims.types";
import { formatSalesOrderAmount } from "@/features/sales-orders/utils/format-sales-order";
import {
  formatSplitMismatchDirection,
  SPLIT_ROUNDING_TOLERANCE,
} from "@/features/sales-orders/utils/sales-order-line-split-mismatch";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type AdjustClaimLineSplitDialogProps = {
  line: ClaimLineItem | null;
  payerName: string;
  open: boolean;
  isSaving?: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (values: {
    clientDue: string;
    insurerDue: string;
  }) => Promise<boolean> | boolean;
};

function parseAmount(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function resolveLineTotal(line: ClaimLineItem): number {
  if (line.total != null && String(line.total).trim()) {
    return parseAmount(line.total);
  }
  return parseAmount(line.unit_price) * parseAmount(line.quantity);
}

function formatBalancedAmount(amount: number): string {
  if (!Number.isFinite(amount)) {
    return "";
  }
  const rounded = Math.round(amount * 100) / 100;
  return rounded.toFixed(2);
}

function getClaimLineSplitMismatch(
  lineTotal: number,
  clientDue: string,
  insurerDue: string,
): { splitTotal: number; delta: number } | null {
  const client = parseAmount(clientDue);
  const insurer = parseAmount(insurerDue);
  if (!Number.isFinite(client) || !Number.isFinite(insurer)) {
    return { splitTotal: Number.NaN, delta: Number.NaN };
  }
  if (client < 0 || insurer < 0) {
    return { splitTotal: client + insurer, delta: client + insurer - lineTotal };
  }
  const splitTotal = client + insurer;
  const delta = splitTotal - lineTotal;
  if (Math.abs(delta) <= SPLIT_ROUNDING_TOLERANCE) {
    return null;
  }
  return { splitTotal, delta };
}

export function AdjustClaimLineSplitDialog({
  line,
  payerName,
  open,
  isSaving = false,
  onOpenChange,
  onSave,
}: AdjustClaimLineSplitDialogProps) {
  const [clientDue, setClientDue] = useState("");
  const [insurerDue, setInsurerDue] = useState("");

  useEffect(() => {
    if (!open || !line) {
      return;
    }
    setClientDue(String(line.client_due ?? "0"));
    setInsurerDue(String(line.payer_due ?? line.total ?? "0"));
  }, [line, open]);

  const lineTotal = useMemo(
    () => (line ? resolveLineTotal(line) : 0),
    [line],
  );
  const mismatch = useMemo(
    () => getClaimLineSplitMismatch(lineTotal, clientDue, insurerDue),
    [clientDue, insurerDue, lineTotal],
  );
  const canSave = Boolean(line) && !mismatch && !isSaving;

  function handleClientDueChange(value: string) {
    setClientDue(value);
    const client = parseAmount(value);
    if (!Number.isFinite(client)) {
      return;
    }
    setInsurerDue(formatBalancedAmount(lineTotal - client));
  }

  function handleInsurerDueChange(value: string) {
    setInsurerDue(value);
    const insurer = parseAmount(value);
    if (!Number.isFinite(insurer)) {
      return;
    }
    setClientDue(formatBalancedAmount(lineTotal - insurer));
  }

  async function handleSave() {
    if (!line || mismatch || isSaving) {
      return;
    }
    const saved = await onSave({
      clientDue,
      insurerDue,
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
      <DialogContent
        className={cn(
          "flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg",
          appFont.className,
        )}
        data-testid="adjust-claim-line-split-dialog"
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <DialogHeader className="border-b border-brand-border px-6 py-5">
            <DialogTitle>Adjust payment split</DialogTitle>
            <DialogDescription>
              {line?.description?.trim()
                ? `Update how ${line.description.trim()} is split between the client and ${payerName}.`
                : `Update how this line is split between the client and ${payerName}.`}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="claim-line-split-client-due"
                  className="text-sm font-medium text-brand-navy"
                >
                  Client due
                </label>
                <Input
                  id="claim-line-split-client-due"
                  type="number"
                  min="0"
                  step="0.01"
                  value={clientDue}
                  disabled={isSaving}
                  onChange={(event) =>
                    handleClientDueChange(event.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="claim-line-split-insurer-due"
                  className="text-sm font-medium text-brand-navy"
                >
                  {payerName} due
                </label>
                <Input
                  id="claim-line-split-insurer-due"
                  type="number"
                  min="0"
                  step="0.01"
                  value={insurerDue}
                  disabled={isSaving}
                  onChange={(event) =>
                    handleInsurerDueChange(event.target.value)
                  }
                />
              </div>
            </div>

            <div className="rounded-lg border border-brand-border bg-slate-50/80 px-4 py-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-brand-muted">Line total</span>
                <span className="font-medium text-brand-navy">
                  {formatSalesOrderAmount(lineTotal)}
                </span>
              </div>
              {mismatch && Number.isFinite(mismatch.delta) ? (
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
                message={
                  Number.isFinite(mismatch.splitTotal)
                    ? `Client + ${payerName} (${formatSalesOrderAmount(mismatch.splitTotal)}) must equal the line total (${formatSalesOrderAmount(lineTotal)}).`
                    : "Enter valid non-negative amounts for both dues."
                }
              />
            ) : null}
          </div>

          <DialogFooter className="mt-0 border-t border-brand-border px-6 py-5">
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
              data-testid="adjust-claim-line-split-save-button"
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

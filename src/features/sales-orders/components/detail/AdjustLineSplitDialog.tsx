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
import type { SalesOrderLineDraft } from "@/features/sales-orders/types/sales-order-line-draft";
import {
  calculateSalesOrderLineDraftTotal,
} from "@/features/sales-orders/types/sales-order-line-draft";
import {
  formatSplitMismatchDirection,
  getLineSplitMismatch,
} from "@/features/sales-orders/utils/sales-order-line-split-mismatch";
import { formatSalesOrderAmount } from "@/features/sales-orders/utils/format-sales-order";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type AdjustLineSplitDialogProps = {
  line: SalesOrderLineDraft | null;
  open: boolean;
  isSaving?: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    lineKey: string,
    values: { adjustedClientDue: string; adjustedInsurerDue: string },
  ) => Promise<boolean> | boolean;
};

function getInitialAmounts(line: SalesOrderLineDraft | null) {
  return {
    clientDue: line?.adjustedClientDue ?? line?.client_due ?? "",
    insurerDue: line?.adjustedInsurerDue ?? line?.insurer_due ?? "",
  };
}

export function AdjustLineSplitDialog({
  line,
  open,
  isSaving = false,
  onOpenChange,
  onSave,
}: AdjustLineSplitDialogProps) {
  const [clientDue, setClientDue] = useState("");
  const [insurerDue, setInsurerDue] = useState("");

  useEffect(() => {
    if (!open || !line) {
      return;
    }

    const initial = getInitialAmounts(line);
    setClientDue(initial.clientDue);
    setInsurerDue(initial.insurerDue);
  }, [line, open]);

  const draftForValidation = useMemo<SalesOrderLineDraft | null>(() => {
    if (!line) {
      return null;
    }

    return {
      ...line,
      adjustedClientDue: clientDue,
      adjustedInsurerDue: insurerDue,
    };
  }, [clientDue, insurerDue, line]);

  const mismatch = draftForValidation
    ? getLineSplitMismatch(draftForValidation)
    : null;
  const lineTotal = line ? calculateSalesOrderLineDraftTotal(line) : 0;
  const canSave = Boolean(line) && !mismatch && !isSaving;

  async function handleSave() {
    if (!line || mismatch || isSaving) {
      return;
    }

    const saved = await onSave(line.key, {
      adjustedClientDue: clientDue,
      adjustedInsurerDue: insurerDue,
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
          <DialogTitle>Adjust client/insurance split</DialogTitle>
          <DialogDescription>
            {line?.productName
              ? `Update how ${line.productName} is split between the client and insurer.`
              : "Update how this line is split between the client and insurer."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="adjust-line-split-client-due"
                className="text-sm font-medium text-brand-navy"
              >
                Client amount
              </label>
              <Input
                id="adjust-line-split-client-due"
                type="number"
                min="0"
                step="0.01"
                value={clientDue}
                disabled={isSaving}
                onChange={(event) => setClientDue(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="adjust-line-split-insurer-due"
                className="text-sm font-medium text-brand-navy"
              >
                Insurance amount
              </label>
              <Input
                id="adjust-line-split-insurer-due"
                type="number"
                min="0"
                step="0.01"
                value={insurerDue}
                disabled={isSaving}
                onChange={(event) => setInsurerDue(event.target.value)}
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
            {mismatch ? (
              <div className="mt-2 flex items-center justify-between gap-4 border-t border-brand-border pt-2">
                <span className="text-brand-muted">Difference</span>
                <span className="font-medium text-brand-navy">
                  {formatSalesOrderAmount(Math.abs(mismatch.delta))}{" "}
                  ({formatSplitMismatchDirection(mismatch.delta)})
                </span>
              </div>
            ) : null}
          </div>

          {mismatch ? (
            <StatusBanner
              variant="error"
              message={`Client + Insurance (${formatSalesOrderAmount(mismatch.splitTotal)}) does not match line total (${formatSalesOrderAmount(mismatch.newTotal)}). Difference: ${formatSalesOrderAmount(Math.abs(mismatch.delta))} (${formatSplitMismatchDirection(mismatch.delta)}).`}
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
            data-testid="adjust-line-split-save-button"
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

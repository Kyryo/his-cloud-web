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
import { formatToothNumbersSummary } from "@/features/dental/lib/dental-teeth-display";
import type { ClaimLineItem } from "@/features/claims/types/claims.types";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export type AssignClaimLineTeethDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  toothNumbers: number[];
  lineItems: ClaimLineItem[];
  /** Prefer this line when opening (e.g. first line). */
  preferredLineId?: number | null;
  title?: string;
  description?: string;
  confirmLabel?: string;
  isSaving?: boolean;
  onConfirm: (lineItemId: number) => void | Promise<void>;
};

function lineLabel(line: ClaimLineItem): string {
  return line.tariff_code?.trim() || `Line #${line.id}`;
}

export function AssignClaimLineTeethDialog({
  open,
  onOpenChange,
  toothNumbers,
  lineItems,
  preferredLineId = null,
  title = "Assign teeth to a line item",
  description,
  confirmLabel = "Assign & save",
  isSaving = false,
  onConfirm,
}: AssignClaimLineTeethDialogProps) {
  const [selectedLineId, setSelectedLineId] = useState<number | null>(null);

  useEffect(() => {
    if (!open) return;
    const preferred =
      (preferredLineId != null &&
        lineItems.some((line) => line.id === preferredLineId) &&
        preferredLineId) ||
      lineItems[0]?.id ||
      null;
    setSelectedLineId(preferred);
  }, [open, preferredLineId, lineItems]);

  const resolvedDescription =
    description ??
    `Choose which claim line should include ${formatToothNumbersSummary(
      toothNumbers,
      "the selected teeth",
    )}.`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-md",
          appFont.className,
        )}
        data-testid="assign-claim-line-teeth-dialog"
      >
        <DialogHeader className="border-b border-brand-border px-6 py-5">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{resolvedDescription}</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-brand-muted">
            Selected teeth
          </p>
          <p
            className="mb-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-brand-navy"
            data-testid="assign-teeth-summary"
          >
            {formatToothNumbersSummary(toothNumbers)}
          </p>

          <fieldset className="space-y-2" disabled={isSaving}>
            <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-brand-muted">
              Claim line item
            </legend>
            <div role="radiogroup" className="space-y-2">
              {lineItems.map((line) => {
                const isSelected = line.id === selectedLineId;
                return (
                  <label
                    key={line.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition-colors",
                      isSelected
                        ? "border-brand-primary bg-brand-tint/40"
                        : "border-brand-border hover:bg-slate-50",
                    )}
                  >
                    <input
                      type="radio"
                      name="assign-claim-line"
                      className="shrink-0"
                      checked={isSelected}
                      onChange={() => setSelectedLineId(line.id)}
                      data-testid={`assign-claim-line-${line.id}`}
                    />
                    <span className="min-w-0 truncate text-sm text-brand-navy">
                      <span className="font-medium">{lineLabel(line)}</span>
                      <span className="text-brand-muted">
                        {" "}
                        · Qty {line.quantity} · {line.unit_price}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>

        <DialogFooter className="border-t border-brand-border px-6 py-4">
          <SecondaryButton
            type="button"
            size="sm"
            className="px-4"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            size="sm"
            className="px-4"
            disabled={isSaving || selectedLineId == null}
            onClick={() => {
              if (selectedLineId == null) return;
              void onConfirm(selectedLineId);
            }}
            data-testid="assign-claim-line-confirm"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              confirmLabel
            )}
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

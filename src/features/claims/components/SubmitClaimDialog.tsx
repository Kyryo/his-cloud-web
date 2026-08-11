"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBanner } from "@/components/ui/status-banner";
import { AdjustClaimLineSplitDialog } from "@/features/claims/components/AdjustClaimLineSplitDialog";
import {
  submitClaim,
  updateClaimLinePaymentSplit,
} from "@/features/claims/services/claims.service";
import type { ClaimDetail, ClaimLineItem } from "@/features/claims/types/claims.types";
import { formatAmountNumber } from "@/features/sales-orders/utils/format-sales-order";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type SubmitClaimDialogProps = {
  claim: ClaimDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (claim: ClaimDetail) => void | Promise<void>;
  onClaimUpdated?: (claim: ClaimDetail) => void | Promise<void>;
};

function claimLineItems(claim: ClaimDetail): ClaimLineItem[] {
  return (claim.claim_invoices ?? []).flatMap(
    (invoice) => invoice.line_items ?? [],
  );
}

function lineTotal(line: ClaimLineItem): string {
  if (line.total != null && String(line.total).trim()) {
    return String(line.total);
  }
  const unit = Number(line.unit_price);
  const qty = Number(line.quantity);
  if (Number.isNaN(unit) || Number.isNaN(qty)) {
    return "0";
  }
  return String(unit * qty);
}

export function SubmitClaimDialog({
  claim,
  open,
  onOpenChange,
  onSuccess,
  onClaimUpdated,
}: SubmitClaimDialogProps) {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingLine, setEditingLine] = useState<ClaimLineItem | null>(null);
  const [isSavingSplit, setIsSavingSplit] = useState(false);
  const lines = useMemo(() => claimLineItems(claim), [claim]);
  const payerName = claim.payer_code?.trim() || "Insurer";
  const isDraft = String(claim.status).toLowerCase() === "draft";

  useEffect(() => {
    if (!open) {
      setError(null);
      setIsSubmitting(false);
      setEditingLine(null);
      setIsSavingSplit(false);
    }
  }, [open]);

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      const submitted = await submitClaim(claim.id);
      toast({
        variant: "success",
        title: "Claim submitted",
        description: `The claim was sent to ${payerName} successfully.`,
      });
      await onSuccess?.(submitted);
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof BffError
          ? formatBffErrorMessage(err.message, err.errors)
          : err instanceof Error
            ? err.message
            : "Something went wrong.";
      setError(message);
      toast({
        variant: "error",
        title: "Could not submit claim",
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveSplit(values: {
    clientDue: string;
    insurerDue: string;
  }): Promise<boolean> {
    if (!editingLine) {
      return false;
    }
    setIsSavingSplit(true);
    try {
      const updated = await updateClaimLinePaymentSplit(claim.id, editingLine.id, {
        client_due: values.clientDue,
        insurer_due: values.insurerDue,
      });
      await onClaimUpdated?.(updated);
      toast({
        variant: "success",
        title: "Payment split updated",
        description: "Client and insurer amounts were saved on the invoice and order.",
      });
      return true;
    } catch (err) {
      toast({
        variant: "error",
        title: "Could not update payment split",
        description:
          err instanceof BffError
            ? formatBffErrorMessage(err.message, err.errors)
            : err instanceof Error
              ? err.message
              : "Something went wrong.",
      });
      return false;
    } finally {
      setIsSavingSplit(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={cn(
            "flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl",
            appFont.className,
          )}
          data-testid="submit-claim-dialog"
        >
          <div className="flex min-h-0 flex-1 flex-col">
            <DialogHeader className="border-b border-brand-border px-6 py-5">
              <DialogTitle>Submit claim</DialogTitle>
              <DialogDescription>
                Review the claimed items below, then submit this claim to{" "}
                {payerName}.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
              <div className="overflow-hidden rounded-xl border border-brand-border">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-brand-border bg-slate-50/80">
                        <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                          Tariff code
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-brand-muted">
                          Description
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-brand-muted">
                          {payerName} due (MWK)
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-brand-muted">
                          Client due (MWK)
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-brand-muted">
                          Total (MWK)
                        </th>
                        {isDraft ? (
                          <th className="px-4 py-3 text-right text-sm font-medium text-brand-muted">
                            <span className="sr-only">Actions</span>
                          </th>
                        ) : null}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border bg-white">
                      {lines.length === 0 ? (
                        <tr>
                          <td
                            colSpan={isDraft ? 7 : 6}
                            className="px-4 py-10 text-center text-sm text-brand-muted"
                          >
                            This claim has no line items to submit.
                          </td>
                        </tr>
                      ) : (
                        lines.map((line, index) => (
                          <tr key={line.id}>
                            <td className="px-4 py-3 text-sm text-brand-muted">
                              {index + 1}
                            </td>
                            <td className="px-4 py-3 font-mono text-sm text-brand-slate">
                              {line.tariff_code?.trim() || "—"}
                            </td>
                            <td className="px-4 py-3 text-sm text-brand-navy">
                              {line.description?.trim() || "—"}
                            </td>
                            <td className="px-4 py-3 text-right text-sm tabular-nums text-brand-slate">
                              {formatAmountNumber(
                                line.payer_due ?? lineTotal(line),
                              )}
                            </td>
                            <td className="px-4 py-3 text-right text-sm tabular-nums text-brand-slate">
                              {formatAmountNumber(line.client_due ?? "0")}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-medium tabular-nums text-brand-navy">
                              {formatAmountNumber(lineTotal(line))}
                            </td>
                            {isDraft ? (
                              <td className="px-4 py-3 text-right">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  disabled={isSubmitting}
                                  className="h-9 rounded-full border-brand-navy/20 px-3.5 text-brand-navy hover:border-brand-navy hover:bg-brand-tint"
                                  onClick={() => setEditingLine(line)}
                                  data-testid={`claim-line-edit-split-${line.id}`}
                                >
                                  Edit
                                </Button>
                              </td>
                            ) : null}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {error ? <StatusBanner variant="error" message={error} /> : null}
            </div>

            <DialogFooter className="mt-0 border-t border-brand-border px-6 py-5">
              <SecondaryButton
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Close
              </SecondaryButton>
              <PrimaryButton
                type="button"
                disabled={isSubmitting || lines.length === 0}
                onClick={() => void handleSubmit()}
                data-testid="submit-claim-dialog-confirm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </PrimaryButton>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <AdjustClaimLineSplitDialog
        line={editingLine}
        payerName={payerName}
        open={Boolean(editingLine)}
        isSaving={isSavingSplit}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setEditingLine(null);
          }
        }}
        onSave={handleSaveSplit}
      />
    </>
  );
}

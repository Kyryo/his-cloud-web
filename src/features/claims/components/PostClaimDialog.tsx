"use client";

import { FilePlus2, Loader2 } from "lucide-react";
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
import {
  createClaimFromInvoice,
  evaluateClaimAdvisories,
} from "@/features/claims/services/claims.service";
import type { ClaimDetail } from "@/features/claims/types/claims.types";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type PostClaimDialogProps = {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (claim: ClaimDetail) => void | Promise<void>;
};

export function PostClaimDialog({
  invoice,
  open,
  onOpenChange,
  onSuccess,
}: PostClaimDialogProps) {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setError(null);
      setIsSubmitting(false);
    }
  }, [open]);

  async function handleCreateClaim() {
    setError(null);
    setIsSubmitting(true);

    try {
      const claim = await createClaimFromInvoice(invoice.id, {
        payer_code: "MASM",
      });

      try {
        await evaluateClaimAdvisories(claim.id);
      } catch (evaluateError) {
        toast({
          variant: "error",
          title: "Claim created, but advisories failed",
          description:
            evaluateError instanceof BffError
              ? formatBffErrorMessage(
                  evaluateError.message,
                  evaluateError.errors,
                )
              : evaluateError instanceof Error
                ? evaluateError.message
                : "Something went wrong while evaluating advisories.",
        });
      }

      toast({
        variant: "success",
        title: "Claim created",
        description: "A draft claim was created for this invoice.",
      });
      await onSuccess?.(claim);
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof BffError
          ? formatBffErrorMessage(err.message, err.errors)
          : err instanceof Error
            ? err.message
            : "Could not create claim.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("max-h-[90vh] overflow-y-auto sm:max-w-lg", appFont.className)}
        data-testid="post-claim-dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FilePlus2 className="size-5 text-brand-primary" aria-hidden="true" />
            Create insurance claim
          </DialogTitle>
          <DialogDescription>
            Create a draft claim for {invoice.name || `invoice #${invoice.id}`}{" "}
            and run advisories. Member verification with the insurer happens later
            at submit.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <SecondaryButton
              type="button"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="button"
              disabled={isSubmitting}
              onClick={() => void handleCreateClaim()}
              data-testid="post-claim-confirm-button"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Creating claim...
                </>
              ) : (
                "Create claim"
              )}
            </PrimaryButton>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

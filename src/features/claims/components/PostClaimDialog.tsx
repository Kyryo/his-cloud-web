"use client";

import { Loader2, ShieldCheck } from "lucide-react";
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
import { RequiredFieldMarker } from "@/components/ui/required-field-marker";
import {
  createClaimFromInvoice,
  extractVerificationToken,
  verifyClaimMember,
} from "@/features/claims/services/claims.service";
import type { Invoice } from "@/features/invoices/types/invoice.types";
import { BffError } from "@/lib/bff-client";
import { coerceToOptionalString } from "@/lib/coerce-string";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type PostClaimDialogProps = {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void | Promise<void>;
};

type Step = "verify" | "creating" | "success";

export function PostClaimDialog({
  invoice,
  open,
  onOpenChange,
  onSuccess,
}: PostClaimDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("verify");
  const [membershipNumber, setMembershipNumber] = useState("");
  const [serviceProviderCode, setServiceProviderCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep("verify");
      setError(null);
      setIsSubmitting(false);
      return;
    }

    setMembershipNumber(coerceToOptionalString(invoice.insurance_number));
    setServiceProviderCode(coerceToOptionalString(invoice.service_provider_code));
  }, [invoice, open]);

  async function handleVerifyAndCreate() {
    const membership = membershipNumber.trim();
    const providerCode = serviceProviderCode.trim();

    if (!membership || !providerCode) {
      setError("Membership number and service provider code are required.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const verification = await verifyClaimMember({
        membership_number: membership,
        service_provider_code: providerCode,
      });

      const token =
        verification.token?.trim() ||
        extractVerificationToken(verification.member) ||
        "";

      if (!token) {
        setError("Member verification succeeded but no verification token was returned.");
        return;
      }

      setStep("creating");
      await createClaimFromInvoice(invoice.id, {
        verification_token: token,
        payer_code: "MASM",
      });

      setStep("success");
      toast({
        variant: "success",
        title: "Claim initiated",
        description: "A draft claim was created for this invoice.",
      });
      await onSuccess?.();
    } catch (err) {
      const message =
        err instanceof BffError
          ? formatBffErrorMessage(err.message, err.errors)
          : err instanceof Error
            ? err.message
            : "Could not initiate claim.";
      setError(message);
      setStep("verify");
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
            <ShieldCheck className="size-5 text-brand-primary" aria-hidden="true" />
            Initiate insurance claim
          </DialogTitle>
          <DialogDescription>
            Verify the member with MASM, then create a draft claim for{" "}
            {invoice.name || `invoice #${invoice.id}`}.
          </DialogDescription>
        </DialogHeader>

        {step === "success" ? (
          <div className="space-y-4 py-2">
            <p className="text-sm text-brand-navy">
              The claim draft is ready. Review the details and submit when you are ready.
            </p>
            <DialogFooter>
              <PrimaryButton type="button" onClick={() => onOpenChange(false)}>
                Done
              </PrimaryButton>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-brand-navy">
                Membership number <RequiredFieldMarker />
              </label>
              <Input
                value={membershipNumber}
                onChange={(event) => setMembershipNumber(event.target.value)}
                className="mt-1.5"
                autoComplete="off"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-brand-navy">
                Service provider code <RequiredFieldMarker />
              </label>
              <Input
                value={serviceProviderCode}
                onChange={(event) => setServiceProviderCode(event.target.value)}
                className="mt-1.5"
                autoComplete="off"
                disabled={isSubmitting}
              />
              {!serviceProviderCode.trim() ? (
                <p className="mt-1 text-xs text-brand-muted">
                  Configure a practitioner mapping under settings → integrations → insurance →
                  MASM if this is missing.
                </p>
              ) : null}
            </div>

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
                onClick={() => void handleVerifyAndCreate()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    {step === "creating" ? "Creating claim..." : "Verifying..."}
                  </>
                ) : (
                  "Verify and initiate"
                )}
              </PrimaryButton>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import { changeClaimStatus } from "@/features/claims/services/claims.service";
import type { ClaimDetail } from "@/features/claims/types/claims.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

const SUBMIT_STATUS = "submitted" as const;
const SUBMIT_STATUS_LABEL = "Submitted";

type ChangeClaimStatusDialogProps = {
  claim: ClaimDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (claim: ClaimDetail) => void | Promise<void>;
};

export function ChangeClaimStatusDialog({
  claim,
  open,
  onOpenChange,
  onSuccess,
}: ChangeClaimStatusDialogProps) {
  const { toast } = useToast();
  const [claimReferenceNumber, setClaimReferenceNumber] = useState(
    claim.claim_reference_number ?? "",
  );
  const [externalClaimId, setExternalClaimId] = useState(
    claim.external_claim_id ?? "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setClaimReferenceNumber(claim.claim_reference_number ?? "");
      setExternalClaimId(claim.external_claim_id ?? "");
      setIsSubmitting(false);
    }
  }, [claim, open]);

  const alreadySubmitted =
    String(claim.status).toLowerCase() === SUBMIT_STATUS;

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const updated = await changeClaimStatus(claim.id, {
        status: SUBMIT_STATUS,
        claim_reference_number: claimReferenceNumber.trim(),
        external_claim_id: externalClaimId.trim(),
      });
      onOpenChange(false);
      await onSuccess?.(updated);
      toast({
        variant: "success",
        title: "Claim status updated",
        description: `Status is now ${SUBMIT_STATUS_LABEL}.`,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not update status",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "Something went wrong.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Change claim status"
      description="Mark this claim as submitted when it was sent to the payer outside HMIS."
      className={cn("sm:max-w-md", appFont.className)}
      data-testid="claim-change-status-dialog"
      footer={
        <>
          <SecondaryButton
            type="button"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            disabled={isSubmitting || alreadySubmitted}
            onClick={() => void handleSubmit()}
            data-testid="claim-change-status-confirm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              "Save status"
            )}
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="claim-status-select">Status</Label>
          <Select value={SUBMIT_STATUS} disabled={isSubmitting}>
            <SelectTrigger
              id="claim-status-select"
              data-testid="claim-change-status-select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SUBMIT_STATUS}>{SUBMIT_STATUS_LABEL}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="claim-reference-number">Claim reference</Label>
          <Input
            id="claim-reference-number"
            value={claimReferenceNumber}
            onChange={(event) => setClaimReferenceNumber(event.target.value)}
            disabled={isSubmitting}
            placeholder="Payer claim reference"
            data-testid="claim-change-status-reference"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="external-claim-id">External claim ID</Label>
          <Input
            id="external-claim-id"
            value={externalClaimId}
            onChange={(event) => setExternalClaimId(event.target.value)}
            disabled={isSubmitting}
            placeholder="Payer portal claim ID"
            data-testid="claim-change-status-external-id"
          />
        </div>
      </div>
    </SectionedDialog>
  );
}

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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClaimAdvisoryClearance, fetchClaim } from "@/features/claims/services/claims.service";
import type {
  AdvisorFinding,
  ClaimDetail,
} from "@/features/claims/types/claims.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type FindingClearDialogProps = {
  finding: AdvisorFinding | null;
  claim: ClaimDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCleared?: (claim: ClaimDetail) => void;
};

export function FindingClearDialog({
  finding,
  claim,
  open,
  onOpenChange,
  onCleared,
}: FindingClearDialogProps) {
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setReason("");
    }
  }, [open, finding?.code]);

  if (!finding) {
    return null;
  }

  async function handleClear() {
    const note = reason.trim();
    if (!note) {
      toast({
        variant: "error",
        title: "Reason required",
        description: "Explain why this finding should no longer block or appear as open.",
      });
      return;
    }
    setIsSaving(true);
    try {
      await createClaimAdvisoryClearance(claim.id, {
        code: finding.code,
        source: finding.source ?? "rules",
        reason: note,
      });
      onOpenChange(false);
      const refreshed = await fetchClaim(claim.id);
      onCleared?.(refreshed);
      toast({
        variant: "success",
        title: "Finding cleared",
        description: "This finding is waived for this claim.",
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not clear this finding",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "Something went wrong.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("gap-0 overflow-hidden p-0 sm:max-w-md", appFont.className)}
        data-testid="claim-advisory-clear-dialog"
      >
        <DialogHeader className="border-b border-brand-border px-6 py-5">
          <DialogTitle>Clear this finding</DialogTitle>
          <DialogDescription>
            {finding.name}. This finding will no longer show as open and will not
            block submit.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 px-6 py-5">
          <Label htmlFor={`clear-reason-${finding.code}`}>
            Reason <span className="text-red-600">*</span>
          </Label>
          <Textarea
            id={`clear-reason-${finding.code}`}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={4}
            placeholder="Explain why this finding should be waived for this claim."
            data-testid="claim-advisory-clear-reason"
          />
        </div>
        <DialogFooter className="mt-0 border-t border-brand-border px-6 py-4">
          <SecondaryButton type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            disabled={isSaving}
            onClick={() => void handleClear()}
            data-testid="claim-advisory-clear-submit"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Clearing...
              </>
            ) : (
              "Clear finding"
            )}
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

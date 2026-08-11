"use client";

import { Loader2, MoreVertical, RefreshCw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { PrimaryButton, SecondaryButton, DestructiveButton } from "@/components/ui/app-buttons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isClaimSubmitBlockedByAdvisories } from "@/features/claims/components/ClaimAdvisoriesPanel";
import {
  checkClaimPayerStatus,
  deleteClaim,
} from "@/features/claims/services/claims.service";
import type { ClaimDetail } from "@/features/claims/types/claims.types";
import { ROUTES } from "@/constants/routes";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type ClaimDetailActionsProps = {
  claim: ClaimDetail;
  onClaimUpdated?: (claim: ClaimDetail) => void;
  onRequestSubmit?: () => void;
  className?: string;
};

function submitBlockedToastId(claimId: number | string) {
  return `claim-${claimId}-submit-blocked`;
}

function shouldShowCheckPayerStatus(claim: ClaimDetail): boolean {
  const status = String(claim.payer_status || "").toLowerCase();
  return status === "awaiting_payer" || status === "processing" || status === "failed";
}

export function ClaimDetailActions({
  claim,
  onClaimUpdated,
  onRequestSubmit,
  className,
}: ClaimDetailActionsProps) {
  const router = useRouter();
  const { toast, dismiss } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCheckingPayer, setIsCheckingPayer] = useState(false);

  const isDraft = String(claim.status).toLowerCase() === "draft";
  const submitBlocked = isClaimSubmitBlockedByAdvisories(claim);
  const showCheckPayerStatus = !isDraft && shouldShowCheckPayerStatus(claim);

  useEffect(() => {
    const toastId = submitBlockedToastId(claim.id);

    if (!isDraft || !submitBlocked) {
      dismiss(toastId);
      return;
    }

    toast({
      id: toastId,
      variant: "warning",
      title: "Submit blocked",
      description:
        "Submit is blocked by advisory rejection risks. Open the Advisories tab to evaluate, resolve, or override.",
      duration: Infinity,
      closeButton: true,
    });
  }, [claim.id, dismiss, isDraft, submitBlocked, toast]);

  useEffect(() => {
    const toastId = submitBlockedToastId(claim.id);
    return () => {
      dismiss(toastId);
    };
  }, [claim.id, dismiss]);

  async function handleCheckPayerStatus() {
    setIsCheckingPayer(true);
    try {
      const result = await checkClaimPayerStatus(claim.id);
      onClaimUpdated?.(result.claim);
      const isFailure =
        result.action === "applied_webhook" &&
        String(result.claim.payer_status || "").toLowerCase() === "failed";
      toast({
        variant: isFailure ? "warning" : "success",
        title: "Payer status checked",
        description: result.message,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not check payer status",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "Something went wrong.",
      });
    } finally {
      setIsCheckingPayer(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteClaim(claim.id);
      setDeleteOpen(false);
      toast({
        variant: "success",
        title: "Claim deleted",
        description: "The draft claim was removed.",
      });
      router.push(ROUTES.claims);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not delete claim",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "Something went wrong.",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  if (!isDraft && !showCheckPayerStatus) {
    return null;
  }

  return (
    <>
      <div className={cn("flex shrink-0 flex-wrap items-center justify-end gap-2", className)}>
        {isDraft ? (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  disabled={isDeleting}
                  aria-label="Claim actions"
                  data-testid="claim-actions-menu-button"
                >
                  <MoreVertical className="size-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-red-700 focus:text-red-700"
                  onClick={() => setDeleteOpen(true)}
                  data-testid="claim-delete-menu-item"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <PrimaryButton
              type="button"
              disabled={submitBlocked || !onRequestSubmit}
              title={
                submitBlocked
                  ? "Resolve rejection-risk advisories or record an override first"
                  : undefined
              }
              onClick={() => onRequestSubmit?.()}
              data-testid="claim-submit-header-button"
            >
              Submit
            </PrimaryButton>
          </>
        ) : null}

        {showCheckPayerStatus ? (
          <PrimaryButton
            type="button"
            disabled={isCheckingPayer}
            onClick={() => void handleCheckPayerStatus()}
            data-testid="claim-check-payer-status-button"
          >
            {isCheckingPayer ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="size-4" aria-hidden="true" />
                Check payer status
              </>
            )}
          </PrimaryButton>
        ) : null}
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete draft claim?</DialogTitle>
            <DialogDescription>
              This permanently removes the draft claim for membership{" "}
              {claim.membership_number || `#${claim.id}`}. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <SecondaryButton
              type="button"
              disabled={isDeleting}
              onClick={() => setDeleteOpen(false)}
            >
              Keep claim
            </SecondaryButton>
            <DestructiveButton
              type="button"
              disabled={isDeleting}
              onClick={() => void handleDelete()}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Deleting...
                </>
              ) : (
                "Delete draft"
              )}
            </DestructiveButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

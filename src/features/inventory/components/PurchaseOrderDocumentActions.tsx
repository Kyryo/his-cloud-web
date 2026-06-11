"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import {
  DestructiveButton,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PurchaseOrder } from "@/features/inventory/types/inventory.types";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type PurchaseOrderAction = "submit" | "confirm" | "cancel";

type PendingAction = Extract<PurchaseOrderAction, "submit" | "cancel">;

type PurchaseOrderDocumentActionsProps = {
  order: PurchaseOrder;
  onAction: (action: PurchaseOrderAction) => Promise<void>;
  className?: string;
};

function getConfirmCopy(
  action: PendingAction,
  referenceNumber: string,
): { title: string; description: string; confirmLabel: string } {
  if (action === "submit") {
    return {
      title: "Submit purchase order?",
      description: `Submit ${referenceNumber} for review. You will not be able to edit line items after submitting.`,
      confirmLabel: "Submit order",
    };
  }

  return {
    title: "Cancel purchase order?",
    description: `${referenceNumber} will be marked as cancelled. This action cannot be undone.`,
    confirmLabel: "Cancel order",
  };
}

export function PurchaseOrderDocumentActions({
  order,
  onAction,
  className,
}: PurchaseOrderDocumentActionsProps) {
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [loadingAction, setLoadingAction] = useState<PurchaseOrderAction | null>(null);

  const showSubmit = order.status === "DRAFT";
  const showConfirm = order.status === "SUBMITTED";
  const showCancel = order.status !== "CANCELLED" && order.status !== "CONFIRMED";

  if (!showSubmit && !showConfirm && !showCancel) {
    return null;
  }

  async function runAction(action: PurchaseOrderAction) {
    setLoadingAction(action);
    try {
      await onAction(action);
      setPendingAction(null);
    } finally {
      setLoadingAction(null);
    }
  }

  const isBusy = loadingAction !== null;
  const pendingCopy = pendingAction
    ? getConfirmCopy(pendingAction, order.reference_number)
    : null;

  return (
    <>
      <div className={cn("flex flex-wrap gap-2", className)}>
        {showSubmit ? (
          <PrimaryButton
            type="button"
            size="sm"
            disabled={isBusy}
            onClick={() => setPendingAction("submit")}
            data-testid="purchase-order-submit-button"
          >
            {loadingAction === "submit" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            Submit
          </PrimaryButton>
        ) : null}

        {showConfirm ? (
          <PrimaryButton
            type="button"
            size="sm"
            disabled={isBusy}
            onClick={() => void runAction("confirm")}
            data-testid="purchase-order-confirm-button"
          >
            {loadingAction === "confirm" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            Confirm
          </PrimaryButton>
        ) : null}

        {showCancel ? (
          <DestructiveButton
            type="button"
            size="sm"
            disabled={isBusy}
            onClick={() => setPendingAction("cancel")}
            data-testid="purchase-order-cancel-button"
          >
            {loadingAction === "cancel" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            Cancel
          </DestructiveButton>
        ) : null}
      </div>

      <Dialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open && !isBusy) {
            setPendingAction(null);
          }
        }}
      >
        <DialogContent className={cn("max-w-md", appFont.className)}>
          <DialogHeader>
            <DialogTitle>{pendingCopy?.title}</DialogTitle>
            <DialogDescription>{pendingCopy?.description}</DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <SecondaryButton
              type="button"
              disabled={isBusy}
              onClick={() => setPendingAction(null)}
            >
              Keep editing
            </SecondaryButton>
            {pendingAction === "cancel" ? (
              <DestructiveButton
                type="button"
                disabled={isBusy}
                onClick={() => void runAction("cancel")}
                data-testid="purchase-order-cancel-confirm-button"
              >
                {isBusy ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : null}
                {pendingCopy?.confirmLabel}
              </DestructiveButton>
            ) : (
              <PrimaryButton
                type="button"
                disabled={isBusy}
                onClick={() => void runAction("submit")}
                data-testid="purchase-order-submit-confirm-button"
              >
                {isBusy ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : null}
                {pendingCopy?.confirmLabel}
              </PrimaryButton>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

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
import type { PurchaseOrderAction } from "@/features/inventory/services/purchase-orders.service";
import type { PurchaseOrder } from "@/features/inventory/types/inventory.types";
import {
  getVisiblePurchaseOrderDocumentActions,
  type PurchaseOrderDocumentActionKey,
} from "@/features/inventory/utils/purchase-order-document-actions";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";
import { useUser } from "@/providers/user-provider";

type PendingAction = Extract<
  PurchaseOrderDocumentActionKey,
  "submit" | "cancel" | "approve" | "reject"
>;

type PurchaseOrderDocumentActionsProps = {
  order: PurchaseOrder;
  onAction: (action: PurchaseOrderAction) => Promise<void>;
  onBeforeSubmit?: () => string | null;
  className?: string;
};

function getConfirmCopy(
  action: PendingAction,
  referenceNumber: string,
): { title: string; description: string; confirmLabel: string } {
  switch (action) {
    case "submit":
      return {
        title: "Submit purchase order?",
        description: `Submit ${referenceNumber} for review. You will not be able to edit line items after submitting.`,
        confirmLabel: "Submit order",
      };
    case "cancel":
      return {
        title: "Cancel purchase order?",
        description: `${referenceNumber} will be marked as cancelled. This action cannot be undone.`,
        confirmLabel: "Cancel order",
      };
    case "approve":
      return {
        title: "Approve purchase order?",
        description: `Approve ${referenceNumber} and post stock to the receiving location.`,
        confirmLabel: "Approve order",
      };
    case "reject":
      return {
        title: "Reject purchase order?",
        description: `${referenceNumber} will be marked as cancelled and returned to the owner.`,
        confirmLabel: "Reject order",
      };
  }
}

export function PurchaseOrderDocumentActions({
  order,
  onAction,
  onBeforeSubmit,
  className,
}: PurchaseOrderDocumentActionsProps) {
  const { toast } = useToast();
  const { userData } = useUser();
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [loadingAction, setLoadingAction] = useState<PurchaseOrderAction | null>(null);

  const visibleActions = useMemo(
    () => getVisiblePurchaseOrderDocumentActions(order, userData?.id),
    [order, userData?.id],
  );

  if (visibleActions.length === 0) {
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

  function openPendingAction(action: PendingAction) {
    if (action === "submit") {
      const validationMessage = onBeforeSubmit?.();
      if (validationMessage) {
        toast({
          title: "Cannot submit purchase order",
          description: validationMessage,
          variant: "error",
        });
        return;
      }
    }

    setPendingAction(action);
  }

  return (
    <>
      <div className={cn("flex flex-wrap gap-2", className)}>
        {visibleActions.includes("cancel") ? (
          <DestructiveButton
            type="button"
            size="sm"
            disabled={isBusy}
            onClick={() => openPendingAction("cancel")}
            data-testid="purchase-order-cancel-button"
          >
            {loadingAction === "cancel" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            Cancel
          </DestructiveButton>
        ) : null}

        {visibleActions.includes("reject") ? (
          <DestructiveButton
            type="button"
            size="sm"
            disabled={isBusy}
            onClick={() => openPendingAction("reject")}
            data-testid="purchase-order-reject-button"
          >
            {loadingAction === "reject" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            Reject
          </DestructiveButton>
        ) : null}

        {visibleActions.includes("submit") ? (
          <PrimaryButton
            type="button"
            size="sm"
            disabled={isBusy}
            onClick={() => openPendingAction("submit")}
            data-testid="purchase-order-submit-button"
          >
            {loadingAction === "submit" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            Submit
          </PrimaryButton>
        ) : null}

        {visibleActions.includes("approve") ? (
          <PrimaryButton
            type="button"
            size="sm"
            disabled={isBusy}
            onClick={() => openPendingAction("approve")}
            data-testid="purchase-order-approve-button"
          >
            {loadingAction === "approve" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            Approve
          </PrimaryButton>
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
            {pendingAction === "cancel" || pendingAction === "reject" ? (
              <DestructiveButton
                type="button"
                disabled={isBusy}
                onClick={() => pendingAction && void runAction(pendingAction)}
                data-testid={
                  pendingAction === "reject"
                    ? "purchase-order-reject-confirm-button"
                    : "purchase-order-cancel-confirm-button"
                }
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
                onClick={() => pendingAction && void runAction(pendingAction)}
                data-testid={
                  pendingAction === "approve"
                    ? "purchase-order-approve-confirm-button"
                    : "purchase-order-submit-confirm-button"
                }
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

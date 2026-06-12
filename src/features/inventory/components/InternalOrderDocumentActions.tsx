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
import type { InternalOrderAction } from "@/features/inventory/services/internal-orders.service";
import type { InternalOrder } from "@/features/inventory/types/inventory.types";
import {
  getVisibleInternalOrderDocumentActions,
  type InternalOrderDocumentActionKey,
} from "@/features/inventory/utils/internal-order-document-actions";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";
import { useUser } from "@/providers/user-provider";

type PendingAction = InternalOrderDocumentActionKey;

type InternalOrderDocumentActionsProps = {
  order: InternalOrder;
  onAction: (action: InternalOrderAction) => Promise<void>;
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
        title: "Submit internal order?",
        description: `Submit ${referenceNumber} for review. Line items cannot be edited after submitting.`,
        confirmLabel: "Submit order",
      };
    case "cancel":
      return {
        title: "Cancel internal order?",
        description: `${referenceNumber} will be marked as cancelled.`,
        confirmLabel: "Cancel order",
      };
    case "approve":
      return {
        title: "Approve internal order?",
        description: `Approve ${referenceNumber} so it can be dispatched.`,
        confirmLabel: "Approve order",
      };
    case "reject":
      return {
        title: "Reject internal order?",
        description: `${referenceNumber} will be marked as rejected.`,
        confirmLabel: "Reject order",
      };
    case "dispatch":
      return {
        title: "Dispatch internal order?",
        description: `Mark stock as dispatched from the source location for ${referenceNumber}.`,
        confirmLabel: "Dispatch order",
      };
    case "receive":
      return {
        title: "Receive internal order?",
        description: `Post stock into the destination location for ${referenceNumber}.`,
        confirmLabel: "Receive order",
      };
  }
}

export function InternalOrderDocumentActions({
  order,
  onAction,
  onBeforeSubmit,
  className,
}: InternalOrderDocumentActionsProps) {
  const { toast } = useToast();
  const { userData } = useUser();
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [loadingAction, setLoadingAction] = useState<InternalOrderAction | null>(null);

  const visibleActions = useMemo(
    () => getVisibleInternalOrderDocumentActions(order, userData?.id),
    [order, userData?.id],
  );

  if (visibleActions.length === 0) {
    return null;
  }

  async function runAction(action: InternalOrderAction) {
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
          title: "Cannot submit internal order",
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
            data-testid="internal-order-cancel-button"
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
            data-testid="internal-order-reject-button"
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
            data-testid="internal-order-submit-button"
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
            data-testid="internal-order-approve-button"
          >
            {loadingAction === "approve" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            Approve
          </PrimaryButton>
        ) : null}

        {visibleActions.includes("dispatch") ? (
          <PrimaryButton
            type="button"
            size="sm"
            disabled={isBusy}
            onClick={() => openPendingAction("dispatch")}
            data-testid="internal-order-dispatch-button"
          >
            {loadingAction === "dispatch" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            Dispatch
          </PrimaryButton>
        ) : null}

        {visibleActions.includes("receive") ? (
          <PrimaryButton
            type="button"
            size="sm"
            disabled={isBusy}
            onClick={() => openPendingAction("receive")}
            data-testid="internal-order-receive-button"
          >
            {loadingAction === "receive" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            Receive
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

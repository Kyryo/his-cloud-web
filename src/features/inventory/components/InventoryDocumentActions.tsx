"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export type InventoryDocumentAction = {
  key: string;
  label: string;
  variant?: "default" | "primary" | "outline" | "destructive";
  confirmation?: {
    title: string;
    description: string;
    confirmLabel: string;
  };
  onClick: () => void | Promise<void>;
};

type InventoryDocumentActionsProps = {
  actions: InventoryDocumentAction[];
  className?: string;
};

export function InventoryDocumentActions({
  actions,
  className,
}: InventoryDocumentActionsProps) {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [pendingAction, setPendingAction] =
    useState<InventoryDocumentAction | null>(null);

  if (actions.length === 0) {
    return null;
  }

  async function handleAction(action: InventoryDocumentAction) {
    setLoadingKey(action.key);
    try {
      await action.onClick();
      setPendingAction(null);
    } finally {
      setLoadingKey(null);
    }
  }

  function handleButtonClick(action: InventoryDocumentAction) {
    if (action.confirmation) {
      setPendingAction(action);
      return;
    }
    void handleAction(action);
  }

  return (
    <>
      <div className={cn("flex flex-wrap gap-2", className)}>
        {actions.map((action) => {
          const isLoading = loadingKey === action.key;

          return (
            <Button
              key={action.key}
              type="button"
              variant={action.variant ?? "outline"}
              size="sm"
              disabled={loadingKey !== null}
              onClick={() => handleButtonClick(action)}
            >
              {isLoading ? (
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
              ) : null}
              {action.label}
            </Button>
          );
        })}
      </div>

      <Dialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open && loadingKey === null) {
            setPendingAction(null);
          }
        }}
      >
        <DialogContent className={cn("max-w-md", appFont.className)}>
          <DialogHeader>
            <DialogTitle>{pendingAction?.confirmation?.title}</DialogTitle>
            <DialogDescription>
              {pendingAction?.confirmation?.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={loadingKey !== null}
              onClick={() => setPendingAction(null)}
            >
              Keep adjustment
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={loadingKey !== null}
              onClick={() => pendingAction && void handleAction(pendingAction)}
            >
              {loadingKey !== null ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : null}
              {pendingAction?.confirmation?.confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

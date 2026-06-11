"use client";

import { Loader2 } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { cn } from "@/lib/utils";

type PurchaseOrderPendingChangesBarProps = {
  isSaving: boolean;
  onSave: () => void;
  onDiscard: () => void;
};

export function PurchaseOrderPendingChangesBar({
  isSaving,
  onSave,
  onDiscard,
}: PurchaseOrderPendingChangesBarProps) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-6 z-40 flex justify-center px-4",
        "pointer-events-none",
      )}
    >
      <div
        className={cn(
          "pointer-events-auto flex w-full max-w-2xl items-center justify-between gap-4",
          "rounded-full border border-brand-border bg-white/95 px-4 py-3 shadow-lg backdrop-blur",
        )}
        data-testid="purchase-order-pending-changes-bar"
      >
        <div className="flex items-center gap-2 text-sm text-brand-slate">
          <span
            className="size-2 rounded-full bg-amber-400"
            aria-hidden="true"
          />
          Unsaved line item changes
        </div>
        <div className="flex items-center gap-2">
          <SecondaryButton
            type="button"
            size="sm"
            disabled={isSaving}
            onClick={onDiscard}
          >
            Discard
          </SecondaryButton>
          <PrimaryButton
            type="button"
            size="sm"
            disabled={isSaving}
            onClick={onSave}
            data-testid="purchase-order-save-lines-button"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

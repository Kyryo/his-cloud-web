"use client";

import { Loader2 } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type SalesOrderPendingChangesBarProps = {
  isSaving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  saveDisabled?: boolean;
  saveDisabledReason?: string | null;
};

export function SalesOrderPendingChangesBar({
  isSaving,
  onSave,
  onDiscard,
  saveDisabled = false,
  saveDisabledReason,
}: SalesOrderPendingChangesBarProps) {
  const isSaveDisabled = isSaving || saveDisabled;

  const saveButton = (
    <PrimaryButton
      type="button"
      size="sm"
      disabled={isSaveDisabled}
      title={saveDisabled ? (saveDisabledReason ?? undefined) : undefined}
      onClick={onSave}
      data-testid="sales-order-save-lines-button"
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
  );

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
        data-testid="sales-order-pending-changes-bar"
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
          {saveDisabled && saveDisabledReason ? (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">{saveButton}</span>
                </TooltipTrigger>
                <TooltipContent>{saveDisabledReason}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            saveButton
          )}
        </div>
      </div>
    </div>
  );
}

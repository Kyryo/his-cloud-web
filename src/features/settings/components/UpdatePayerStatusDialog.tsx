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
import { Switch } from "@/components/ui/switch";
import { updateOrganizationPayer } from "@/features/settings/services/settings.service";
import type { OrganizationPayer } from "@/features/settings/types/settings.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";

type UpdatePayerStatusDialogProps = {
  payer: OrganizationPayer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (payer: OrganizationPayer) => void;
};

export function UpdatePayerStatusDialog({
  payer,
  open,
  onOpenChange,
  onUpdated,
}: UpdatePayerStatusDialogProps) {
  const { toast } = useToast();
  const [isActive, setIsActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && payer) {
      setIsActive(payer.is_active);
    }
  }, [open, payer]);

  async function handleSave() {
    if (!payer) {
      return;
    }

    if (isActive === payer.is_active) {
      onOpenChange(false);
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateOrganizationPayer(payer.uuid, {
        is_active: isActive,
      });
      toast({
        variant: "success",
        title: updated.is_active ? "Payer reactivated" : "Payer deactivated",
        description: `${updated.name} is now ${updated.is_active ? "active" : "inactive"}.`,
      });
      onUpdated(updated);
      onOpenChange(false);
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not update payer",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "Something went wrong while updating this payer.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("sm:max-w-md", appFont.className)}
        data-testid="update-payer-status-dialog"
      >
        <DialogHeader>
          <DialogTitle>
            {payer?.is_active ? "Deactivate payer" : "Reactivate payer"}
          </DialogTitle>
          <DialogDescription>
            Turn {payer?.name ?? "this payer"} on or off for billing and scheme
            workflows.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-xl border border-brand-border bg-slate-50/40 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-brand-muted">
              Payer
            </p>
            <p className="mt-1 text-sm font-medium text-brand-navy">
              {payer?.name ?? "—"}
            </p>
            {payer?.code ? (
              <p className="mt-0.5 text-xs text-brand-muted">{payer.code}</p>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-brand-border px-4 py-3">
            <div className="min-w-0">
              <Label htmlFor="payer-active" className="text-sm text-brand-navy">
                Payer is {isActive ? "active" : "inactive"}
              </Label>
              <p className="mt-1 text-xs text-brand-muted">
                {isActive
                  ? "Active payers can be used for schemes and billing."
                  : "Inactive payers stay on file and are hidden from new billing flows."}
              </p>
            </div>
            <Switch
              id="payer-active"
              checked={isActive}
              disabled={isSaving || !payer}
              onCheckedChange={setIsActive}
              data-testid="payer-active-switch"
            />
          </div>
        </div>

        <DialogFooter>
          <SecondaryButton
            type="button"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            type="button"
            disabled={isSaving || !payer}
            onClick={() => void handleSave()}
            data-testid="payer-status-save"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

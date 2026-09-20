"use client";

import { Loader2 } from "lucide-react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { SectionedDialog } from "@/components/ui/sectioned-dialog";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type ConfirmLabActionDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  isSubmitting?: boolean;
  tone?: "default" | "danger";
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  children?: React.ReactNode;
};

export function ConfirmLabActionDialog({
  open,
  title,
  description,
  confirmLabel,
  isSubmitting = false,
  tone = "default",
  onOpenChange,
  onConfirm,
  children,
}: ConfirmLabActionDialogProps) {
  return (
    <SectionedDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      className={cn("sm:max-w-md", appFont.className)}
      data-testid="confirm-lab-action-dialog"
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
            disabled={isSubmitting}
            onClick={onConfirm}
            className={
              tone === "danger"
                ? "bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-600"
                : undefined
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Working…
              </>
            ) : (
              confirmLabel
            )}
          </PrimaryButton>
        </>
      }
    >
      {children ?? (
        <p className="text-sm text-brand-slate">
          This action will be recorded against the laboratory order.
        </p>
      )}
    </SectionedDialog>
  );
}

"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";

type SetupSaveActionsProps = {
  formId: string;
  open: boolean;
  isSubmitting: boolean;
  disabled?: boolean;
  onCancel: () => void;
  onIntent: (addAnother: boolean) => void;
  cancelLabel?: string;
};

export function SetupSaveActions({
  formId,
  open,
  isSubmitting,
  disabled = false,
  onCancel,
  onIntent,
  cancelLabel = "Cancel",
}: SetupSaveActionsProps) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!open) {
      setArmed(false);
      return;
    }

    const timer = window.setTimeout(() => setArmed(true), 250);
    return () => window.clearTimeout(timer);
  }, [open]);

  const blocked = isSubmitting || disabled || !armed;

  return (
    <>
      <SecondaryButton type="button" disabled={isSubmitting} onClick={onCancel}>
        {cancelLabel}
      </SecondaryButton>
      <SecondaryButton
        type="submit"
        form={formId}
        disabled={blocked}
        onClick={() => onIntent(true)}
      >
        Save and add another
      </SecondaryButton>
      <PrimaryButton
        type="submit"
        form={formId}
        disabled={blocked}
        onClick={() => onIntent(false)}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Saving...
          </>
        ) : (
          "Save"
        )}
      </PrimaryButton>
    </>
  );
}

"use client";

import { SpinnerGlyph } from "@/components/loading-spinner";
import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { cn } from "@/lib/utils";

type TherapyFormActionBarProps = {
  isSubmitting: boolean;
  message: string;
  saveLabel: string;
  onCancel: () => void;
};

export function TherapyFormActionBar({
  isSubmitting,
  message,
  saveLabel,
  onCancel,
}: TherapyFormActionBarProps) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4",
      )}
    >
      <div
        className={cn(
          "pointer-events-auto flex w-full max-w-2xl items-center justify-between gap-4",
          "rounded-full border border-brand-border bg-white/95 px-4 py-3 shadow-lg backdrop-blur",
        )}
      >
        <div className="flex items-center gap-2 text-sm text-brand-slate">
          <span
            className="size-2 rounded-full bg-amber-400"
            aria-hidden="true"
          />
          {message}
        </div>
        <div className="flex items-center gap-2">
          <SecondaryButton
            type="button"
            size="sm"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? <SpinnerGlyph size="xs" /> : null}
            {isSubmitting ? "Saving..." : saveLabel}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ConfirmActionButtonProps = {
  children: ReactNode;
  confirmLabel: string;
  onConfirm: () => void | Promise<unknown>;
  disabled?: boolean;
  className?: string;
};

/** Destructive action that needs a second click, without a blocking modal. */
export function ConfirmActionButton({
  children,
  confirmLabel,
  onConfirm,
  disabled = false,
  className,
}: ConfirmActionButtonProps) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={() => setArmed(true)}
        className={cn("gap-1.5 text-brand-muted hover:text-red-600", className)}
      >
        {children}
      </Button>
    );
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        type="button"
        size="sm"
        variant="destructive"
        disabled={disabled}
        onClick={() => {
          setArmed(false);
          void onConfirm();
        }}
        className="rounded-full"
      >
        {confirmLabel}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => setArmed(false)}
        className="text-brand-muted"
      >
        Keep
      </Button>
    </div>
  );
}

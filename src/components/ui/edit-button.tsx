"use client";

import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EditButtonProps = Omit<ComponentProps<typeof Button>, "variant"> & {
  label?: string;
};

/**
 * Subtle edit trigger for summary panels and sidebars.
 * Uses the same soft brand tint as SecondaryButton hover for consistency.
 */
export function EditButton({
  label = "Edit",
  className,
  children,
  type = "button",
  ...props
}: EditButtonProps) {
  return (
    <Button
      type={type}
      variant="outline"
      size="sm"
      className={cn(
        "h-7 rounded-md border-brand-navy bg-brand-tint px-2.5 text-xs font-normal text-brand-navy",
        "hover:border-brand-navy hover:bg-brand-primary/10 hover:text-brand-navy",
        "disabled:border-brand-navy/40 disabled:bg-brand-tint/60 disabled:text-brand-navy/50",
        className,
      )}
      {...props}
    >
      {children ?? label}
    </Button>
  );
}

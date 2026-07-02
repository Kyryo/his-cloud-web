"use client";

import type { VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";

import { Badge, badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusPillVariant = NonNullable<
  VariantProps<typeof badgeVariants>["variant"]
>;

type StatusPillProps = {
  label: string;
  variant?: StatusPillVariant;
  icon?: LucideIcon;
  className?: string;
};

export function StatusPill({
  label,
  variant = "outline",
  icon: Icon,
  className,
}: StatusPillProps) {
  return (
    <Badge variant={variant} className={cn("gap-1 font-normal", className)}>
      {Icon ? <Icon className="size-3 shrink-0" aria-hidden="true" /> : null}
      {label}
    </Badge>
  );
}

import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusDotBadgeTone =
  | "success"
  | "primary"
  | "info"
  | "warning"
  | "danger"
  | "neutral";

const TONES: Record<
  StatusDotBadgeTone,
  {
    variant: "success" | "secondary" | "outline" | "warning";
    className?: string;
    dotClassName: string;
  }
> = {
  success: { variant: "success", dotClassName: "bg-emerald-500" },
  primary: {
    variant: "secondary",
    className: "border-brand-primary/20",
    dotClassName: "bg-brand-primary",
  },
  info: {
    variant: "outline",
    className: "border-sky-200 bg-sky-50 text-sky-800",
    dotClassName: "bg-sky-500",
  },
  warning: { variant: "warning", dotClassName: "bg-amber-500" },
  danger: { variant: "outline", dotClassName: "bg-rose-500" },
  neutral: {
    variant: "outline",
    className: "text-brand-muted",
    dotClassName: "bg-dash-muted",
  },
};

type StatusDotBadgeProps = {
  tone: StatusDotBadgeTone;
  children: ReactNode;
  className?: string;
};

export function StatusDotBadge({ tone, children, className }: StatusDotBadgeProps) {
  const config = TONES[tone];

  return (
    <Badge
      variant={config.variant}
      className={cn("gap-1.5 font-normal", config.className, className)}
      data-tone={tone}
    >
      <span
        className={cn("size-1.5 rounded-full", config.dotClassName)}
        aria-hidden="true"
      />
      {children}
    </Badge>
  );
}

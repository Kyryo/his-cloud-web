"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type StatusBannerVariant = "error" | "warning" | "success" | "info";

type StatusBannerProps = {
  variant: StatusBannerVariant;
  message: string;
  description?: string;
  icon?: LucideIcon;
  /** When false, renders text-only alert chrome with no leading icon. */
  showIcon?: boolean;
  className?: string;
  children?: ReactNode;
  id?: string;
  "data-testid"?: string;
};

const VARIANT_STYLES: Record<
  StatusBannerVariant,
  { container: string; icon: string; message: string; description: string }
> = {
  error: {
    container: "border-red-200 bg-red-50/80",
    icon: "text-red-600",
    message: "text-red-900",
    description: "text-red-800/90",
  },
  warning: {
    container: "border-amber-200 bg-amber-50/80",
    icon: "text-amber-600",
    message: "text-amber-900",
    description: "text-amber-800/90",
  },
  success: {
    container: "border-emerald-200 bg-emerald-50/80",
    icon: "text-emerald-600",
    message: "text-emerald-900",
    description: "text-emerald-800/90",
  },
  info: {
    container: "border-brand-border bg-slate-50/80",
    icon: "text-brand-primary",
    message: "text-brand-navy",
    description: "text-brand-muted",
  },
};

const DEFAULT_ICONS: Record<StatusBannerVariant, LucideIcon> = {
  error: AlertCircle,
  warning: AlertTriangle,
  success: CheckCircle2,
  info: Info,
};

export function StatusBanner({
  variant,
  message,
  description,
  icon,
  showIcon = true,
  className,
  children,
  id,
  "data-testid": dataTestId,
}: StatusBannerProps) {
  const styles = VARIANT_STYLES[variant];
  const Icon = icon ?? DEFAULT_ICONS[variant];

  return (
    <div
      id={id}
      role={variant === "error" || variant === "warning" ? "alert" : "status"}
      data-testid={dataTestId}
      className={cn(
        "flex gap-3 rounded-lg border px-4 py-3 text-sm",
        styles.container,
        className,
      )}
    >
      {showIcon ? (
        <Icon
          className={cn("mt-0.5 size-4 shrink-0", styles.icon)}
          aria-hidden="true"
        />
      ) : null}
      <div className="min-w-0 flex-1 space-y-1">
        <p className={cn("font-medium leading-relaxed", styles.message)}>
          {message}
        </p>
        {description ? (
          <p className={cn("text-sm leading-relaxed", styles.description)}>
            {description}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}

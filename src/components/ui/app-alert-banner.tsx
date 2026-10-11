"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export type AppAlertBannerVariant = "warning" | "error" | "success" | "info";

type AppAlertBannerProps = {
  message: string;
  variant?: AppAlertBannerVariant;
  icon?: LucideIcon;
  showIcon?: boolean;
  onClick?: () => void;
  href?: string;
  testId?: string;
  className?: string;
};

const VARIANT_STYLES: Record<
  AppAlertBannerVariant,
  { bar: string; icon: string; hover: string; role: "alert" | "status" }
> = {
  warning: {
    bar: "border-amber-200 bg-amber-50 text-amber-950",
    icon: "text-amber-700",
    hover: "hover:bg-amber-100",
    role: "alert",
  },
  error: {
    bar: "border-red-200 bg-red-50 text-red-950",
    icon: "text-red-700",
    hover: "hover:bg-red-100",
    role: "alert",
  },
  success: {
    bar: "border-emerald-200 bg-emerald-50 text-emerald-950",
    icon: "text-emerald-700",
    hover: "hover:bg-emerald-100",
    role: "status",
  },
  info: {
    bar: "border-brand-border bg-brand-tint text-brand-navy",
    icon: "text-brand-primary",
    hover: "hover:bg-brand-tint/80",
    role: "status",
  },
};

const DEFAULT_ICONS: Record<AppAlertBannerVariant, LucideIcon> = {
  warning: AlertTriangle,
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

export function AppAlertBanner({
  message,
  variant = "warning",
  icon,
  showIcon = true,
  onClick,
  href,
  testId,
  className,
}: AppAlertBannerProps) {
  const styles = VARIANT_STYLES[variant];
  const Icon = icon ?? DEFAULT_ICONS[variant];
  const interactive = Boolean(onClick || href);
  const classNames = cn(
    "relative z-30 flex w-full shrink-0 items-center justify-center gap-2 border-b px-4 py-2.5 text-center text-sm font-medium",
    styles.bar,
    interactive && styles.hover,
    className,
  );
  const label = (
    <>
      {showIcon ? <Icon className={cn("size-4 shrink-0", styles.icon)} aria-hidden="true" /> : null}
      <span>{message}</span>
    </>
  );

  if (onClick) {
    return (
      <button type="button" data-testid={testId} className={classNames} onClick={onClick}>
        {label}
      </button>
    );
  }

  if (href) {
    return (
      <Link href={href} data-testid={testId} className={classNames}>
        {label}
      </Link>
    );
  }

  return (
    <div role={styles.role} data-testid={testId} className={classNames}>
      {label}
    </div>
  );
}

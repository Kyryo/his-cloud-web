import { CheckCircle2, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: "default" | "success";
  className?: string;
  "data-testid"?: string;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "default",
  className,
  "data-testid": testId,
}: EmptyStateProps) {
  const Icon = icon ?? (variant === "success" ? CheckCircle2 : undefined);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-12 text-center",
        className,
      )}
      data-testid={testId}
    >
      {Icon ? (
        <div
          className={cn(
            "flex size-12 items-center justify-center rounded-2xl",
            variant === "success"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-slate-100 text-brand-muted",
          )}
        >
          <Icon className="size-6" strokeWidth={1.75} aria-hidden="true" />
        </div>
      ) : null}
      <h3 className="mt-4 text-sm font-semibold text-brand-navy">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-brand-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

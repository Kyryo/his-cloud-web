import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DetailTabEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
  "data-testid"?: string;
};

export function DetailTabEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  "data-testid": testId,
}: DetailTabEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-75 flex-col items-center justify-center rounded-xl border border-dashed border-dash-border bg-white px-6 py-14 text-center",
        className,
      )}
      data-testid={testId}
    >
      <div className="flex size-13 items-center justify-center rounded-2xl bg-slate-50 text-brand-muted shadow-2xs ring-1 ring-slate-200/60">
        <Icon className="size-6 text-brand-slate" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-brand-navy">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-brand-muted">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

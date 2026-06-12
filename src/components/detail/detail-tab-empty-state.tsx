import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type DetailTabEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  "data-testid"?: string;
};

export function DetailTabEmptyState({
  icon: Icon,
  title,
  description,
  action,
  "data-testid": testId,
}: DetailTabEmptyStateProps) {
  return (
    <div
      className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-brand-border bg-white px-6 py-12 text-center"
      data-testid={testId}
    >
      <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-brand-muted">
        <Icon className="size-6" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-brand-navy">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-brand-muted">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

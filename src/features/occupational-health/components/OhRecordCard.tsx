import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type OhRecordCardProps = {
  title: ReactNode;
  meta?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

/** Compact white card used in the OH “This visit” column. */
export function OhRecordCard({
  title,
  meta,
  children,
  actions,
  className,
}: OhRecordCardProps) {
  return (
    <article
      className={cn(
        "rounded-lg border border-dash-border/80 bg-white px-4 py-3",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <div className="text-sm font-semibold text-brand-navy">{title}</div>
          {meta ? <p className="text-xs text-dash-muted">{meta}</p> : null}
          {children}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </article>
  );
}

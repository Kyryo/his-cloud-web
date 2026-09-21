import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type OpdConsultColumnHeaderProps = {
  /** Constant zone label so the clinician always knows which column they are in. */
  eyebrow: string;
  title: string;
  /** Badge or counter rendered next to the title. */
  meta?: ReactNode;
  action?: ReactNode;
  className?: string;
  "data-testid"?: string;
};

/**
 * Shared heading for the three consult columns. Each column is its own scroll
 * container, so this pins to the top of that column while its content moves.
 */
export function OpdConsultColumnHeader({
  eyebrow,
  title,
  meta,
  action,
  className,
  "data-testid": dataTestId,
}: OpdConsultColumnHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-dash-border/70 px-4 py-2.5 sm:px-5",
        className,
      )}
      data-testid={dataTestId}
    >
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-dash-muted">
          {eyebrow}
        </p>
        <div className="flex items-baseline gap-2">
          <h2 className="truncate text-sm font-semibold tracking-tight text-brand-navy">
            {title}
          </h2>
          {meta}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}

/** Small counter badge used beside a column title. */
export function OpdConsultCountBadge({ count }: { count: number }) {
  if (count <= 0) {
    return null;
  }

  return (
    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium leading-none tabular-nums text-brand-muted">
      {count}
    </span>
  );
}

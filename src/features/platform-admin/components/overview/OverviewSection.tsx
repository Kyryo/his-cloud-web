import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: string;
  /** Large headline metric shown under the title. */
  headline?: ReactNode;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
};

/** Flat section: title block + optional actions, no card chrome. */
export function OverviewSection({
  title,
  description,
  headline,
  actions,
  className,
  children,
}: Props) {
  return (
    <section className={cn("min-w-0 space-y-5", className)}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-[13px] font-medium text-muted-foreground">
            {title}
          </h2>
          {headline}
          {description ? (
            <p className="max-w-prose text-[13px] leading-relaxed text-muted-foreground/90">
              {description}
            </p>
          ) : null}
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}

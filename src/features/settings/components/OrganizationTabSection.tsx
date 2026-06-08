import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type OrganizationTabSectionProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  /** When false, only children render (e.g. empty tab state). Defaults to true. */
  showHeader?: boolean;
};

/** Section header for organization settings tabs (title, description, optional actions). */
export function OrganizationTabSection({
  title,
  description,
  actions,
  children,
  className,
  showHeader = true,
}: OrganizationTabSectionProps) {
  return (
    <section className={cn(showHeader ? "space-y-5" : undefined, className)}>
      {showHeader ? (
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-brand-navy">{title}</h2>
            {description ? (
              <p className="text-sm text-brand-muted">{description}</p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 items-center gap-3">{actions}</div>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

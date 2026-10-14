import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description?: string;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
};

/** Flat, headed section used on the platform admin overview (no card chrome). */
export function PlatformAdminOverviewSection({
  title,
  description,
  aside,
  className,
  children,
}: Props) {
  return (
    <section className={cn("space-y-4", className)}>
      <header className="flex flex-wrap items-end justify-between gap-2 border-b border-border pb-3">
        <div className="space-y-0.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {aside}
      </header>
      {children}
    </section>
  );
}

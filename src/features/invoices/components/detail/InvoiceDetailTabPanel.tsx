"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type InvoiceDetailTabPanelProps = {
  isActive: boolean;
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  "data-testid"?: string;
};

export function InvoiceDetailTabPanel({
  isActive,
  title,
  description,
  action,
  children,
  className,
  "data-testid": dataTestId,
}: InvoiceDetailTabPanelProps) {
  if (!isActive) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)} data-testid={dataTestId}>
      {title ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dash-border/80 pb-3">
          <div>
            <h2 className="text-sm font-semibold text-brand-navy">{title}</h2>
            {description ? (
              <p className="text-xs text-brand-muted">{description}</p>
            ) : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </div>
  );
}

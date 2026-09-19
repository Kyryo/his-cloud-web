"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type LabCatalogEmptyStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: ReactNode;
  "data-testid"?: string;
};

export function LabCatalogEmptyState({
  title,
  description,
  icon: Icon,
  action,
  "data-testid": dataTestId = "lab-catalog-empty-state",
}: LabCatalogEmptyStateProps) {
  return (
    <div className="px-6 py-12 text-center" data-testid={dataTestId}>
      {Icon ? (
        <Icon
          className="mx-auto mb-3 size-8 text-brand-muted"
          aria-hidden="true"
        />
      ) : null}
      <h2 className="text-base font-semibold text-brand-navy">{title}</h2>
      <p className="mt-1 text-sm text-brand-muted">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

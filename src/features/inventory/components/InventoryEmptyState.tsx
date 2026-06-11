import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type InventoryEmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function InventoryEmptyState({
  title,
  description,
  action,
  className,
}: InventoryEmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-brand-border bg-white px-6 py-14 text-center",
        className,
      )}
    >
      <h2 className="text-lg font-semibold text-brand-navy">{title}</h2>
      <p className="mt-2 text-sm text-brand-muted">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

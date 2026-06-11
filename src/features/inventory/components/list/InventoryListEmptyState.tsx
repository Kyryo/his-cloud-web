import type { LucideIcon } from "lucide-react";

import { AddActionButton } from "@/components/ui/app-buttons";

type InventoryListEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  "data-testid"?: string;
};

export function InventoryListEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  "data-testid": dataTestId,
}: InventoryListEmptyStateProps) {
  return (
    <div
      className="flex min-h-[min(420px,calc(100vh-16rem))] flex-col items-center justify-center px-6 py-16 text-center"
      data-testid={dataTestId}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-brand-muted">
        <Icon className="size-7" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-brand-navy">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-brand-muted">{description}</p>
      {actionLabel && onAction ? (
        <AddActionButton
          label={actionLabel}
          className="mt-6"
          onClick={onAction}
        />
      ) : null}
    </div>
  );
}

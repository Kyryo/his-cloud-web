"use client";

import { UserIdenticon } from "@/components/UserIdenticon";

type InventoryCreatedByCellProps = {
  name?: string | null;
};

export function InventoryCreatedByCell({ name }: InventoryCreatedByCellProps) {
  const label = name?.trim();

  if (!label) {
    return <span className="text-sm text-dash-muted">Unknown</span>;
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <UserIdenticon
        seed={label}
        name={label}
        className="size-7 shrink-0 rounded-full"
      />
      <span className="truncate text-sm text-brand-navy">{label}</span>
    </div>
  );
}

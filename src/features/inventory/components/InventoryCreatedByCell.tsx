"use client";

import { UserIdenticon } from "@/components/UserIdenticon";
import { cn } from "@/lib/utils";

type InventoryCreatedByCellProps = {
  name?: string | null;
  size?: "default" | "sm";
};

export function InventoryCreatedByCell({
  name,
  size = "default",
}: InventoryCreatedByCellProps) {
  const label = name?.trim();

  if (!label) {
    return <span className="text-sm text-dash-muted">Unknown</span>;
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <UserIdenticon
        seed={label}
        name={label}
        className={cn(
          "shrink-0 rounded-full",
          size === "sm" ? "size-5" : "size-7",
        )}
        fallbackClassName={size === "sm" ? "text-[9px]" : undefined}
      />
      <span className="truncate text-sm text-brand-navy">{label}</span>
    </div>
  );
}

"use client";

import { UserIdenticon } from "@/components/UserIdenticon";
import { cn } from "@/lib/utils";

type InventoryCreatedByCellProps = {
  name?: string | null;
  imageUrl?: string | null;
  size?: "default" | "sm";
};

export function InventoryCreatedByCell({
  name,
  imageUrl,
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
        imageUrl={imageUrl}
        className={cn(
          "shrink-0 rounded-md",
          size === "sm" ? "size-5" : "size-7",
        )}
        fallbackClassName={cn(
          "rounded-md",
          size === "sm" ? "text-[9px]" : undefined,
        )}
      />
      <span className="truncate text-sm text-brand-navy">{label}</span>
    </div>
  );
}

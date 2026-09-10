import { ArrowRight, MapPin } from "lucide-react";

import { cn } from "@/lib/utils";

type InventoryLocationChipProps = {
  name?: string | null;
  emptyLabel?: string;
  className?: string;
};

export function InventoryLocationChip({
  name,
  emptyLabel = "—",
  className,
}: InventoryLocationChipProps) {
  const label = name?.trim() || emptyLabel;
  const isEmpty = !name?.trim();

  return (
    <span
      className={cn(
        "inline-flex max-w-[14rem] items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium",
        isEmpty ? "text-dash-muted" : "text-brand-navy",
        className,
      )}
    >
      <MapPin className="size-3 shrink-0 text-brand-muted" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </span>
  );
}

type InventoryLocationRouteProps = {
  from?: string | null;
  to?: string | null;
};

export function InventoryLocationRoute({
  from,
  to,
}: InventoryLocationRouteProps) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
      <InventoryLocationChip name={from} />
      <ArrowRight className="size-3.5 shrink-0 text-dash-muted" aria-hidden="true" />
      <InventoryLocationChip name={to} />
    </div>
  );
}

"use client";

import { Badge } from "@/components/ui/badge";
import { formatLabOrderStatusLabel } from "@/features/laboratory/utils/format-lab-order";
import { cn } from "@/lib/utils";

type LabOrderStatusBadgeProps = {
  status: string | undefined;
  className?: string;
};

export function LabOrderStatusBadge({
  status,
  className,
}: LabOrderStatusBadgeProps) {
  const label = formatLabOrderStatusLabel(status);

  if (status === "COMPLETED") {
    return (
      <Badge variant="success" className={cn("gap-1.5 font-normal", className)}>
        <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
        {label}
      </Badge>
    );
  }

  if (status === "CANCELLED") {
    return (
      <Badge variant="outline" className={cn("gap-1.5 font-normal", className)}>
        <span className="size-1.5 rounded-full bg-rose-500" aria-hidden="true" />
        {label}
      </Badge>
    );
  }

  if (status === "IN_LAB" || status === "PARTIAL") {
    return (
      <Badge variant="secondary" className={cn("gap-1.5 font-normal", className)}>
        <span className="size-1.5 rounded-full bg-brand-primary" aria-hidden="true" />
        {label}
      </Badge>
    );
  }

  if (status === "COLLECTING") {
    return (
      <Badge variant="outline" className={cn("gap-1.5 font-normal", className)}>
        <span className="size-1.5 rounded-full bg-amber-500" aria-hidden="true" />
        {label}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 font-normal text-brand-muted", className)}
    >
      <span className="size-1.5 rounded-full bg-dash-muted" aria-hidden="true" />
      {label}
    </Badge>
  );
}

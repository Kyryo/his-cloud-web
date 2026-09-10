"use client";

import { StatusPill } from "@/components/ui/status-pill";
import {
  formatReceivablesAgingLabel,
  getReceivablesAgingVariant,
} from "@/features/receivables/utils/format-receivables";

type ReceivablesAgingBadgeProps = {
  bucket: string;
  className?: string;
};

export function ReceivablesAgingBadge({
  bucket,
  className,
}: ReceivablesAgingBadgeProps) {
  return (
    <StatusPill
      label={formatReceivablesAgingLabel(bucket)}
      variant={getReceivablesAgingVariant(bucket)}
      className={className}
    />
  );
}

"use client";

import { Ban, CheckCircle2, FileEdit } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { StatusPill, type StatusPillVariant } from "@/components/ui/status-pill";
import type { PaymentState } from "@/features/payments/types/payment.types";
import { formatPaymentStateLabel } from "@/features/payments/utils/payment-status";

const STATE_CONFIG: Record<
  string,
  { variant: StatusPillVariant; icon: LucideIcon }
> = {
  draft: { variant: "outline", icon: FileEdit },
  posted: { variant: "success", icon: CheckCircle2 },
  cancel: { variant: "destructive", icon: Ban },
};

export function PaymentStatusBadge({
  state,
  className,
}: {
  state: PaymentState;
  className?: string;
}) {
  const normalized = String(state || "").toLowerCase();
  const config = STATE_CONFIG[normalized] ?? {
    variant: "outline" as const,
    icon: FileEdit,
  };

  return (
    <StatusPill
      label={formatPaymentStateLabel(state)}
      variant={config.variant}
      icon={config.icon}
      className={className}
    />
  );
}

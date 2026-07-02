"use client";

import { AlertCircle, CheckCircle2, CircleDollarSign, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { StatusPill, type StatusPillVariant } from "@/components/ui/status-pill";
import type { InvoicePaymentStatus } from "@/features/invoices/types/invoice.types";
import { formatInvoicePaymentStatusLabel } from "@/features/invoices/utils/invoice-payment-status";

const STATUS_CONFIG: Record<
  string,
  { variant: StatusPillVariant; icon: LucideIcon }
> = {
  not_paid: { variant: "destructive", icon: AlertCircle },
  partially_paid: { variant: "warning", icon: Clock },
  paid: { variant: "success", icon: CheckCircle2 },
  overpaid: { variant: "outline", icon: CircleDollarSign },
};

type InvoicePaymentStatusBadgeProps = {
  status: InvoicePaymentStatus;
  className?: string;
};

export function InvoicePaymentStatusBadge({
  status,
  className,
}: InvoicePaymentStatusBadgeProps) {
  const normalized = String(status || "").toLowerCase();
  const config = STATUS_CONFIG[normalized] ?? {
    variant: "outline" as const,
    icon: AlertCircle,
  };

  return (
    <StatusPill
      label={formatInvoicePaymentStatusLabel(normalized)}
      variant={config.variant}
      icon={config.icon}
      className={className}
    />
  );
}

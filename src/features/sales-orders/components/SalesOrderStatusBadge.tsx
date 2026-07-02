"use client";

import {
  Ban,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  FileEdit,
  Lock,
  Send,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { StatusPill, type StatusPillVariant } from "@/components/ui/status-pill";
import type {
  SalesOrderInvoiceStatus,
  SalesOrderState,
} from "@/features/sales-orders/types/sales-order.types";
import {
  formatSalesOrderInvoiceStatusLabel,
  formatSalesOrderStateLabel,
  getSalesOrderInvoiceStatusBadgeVariant,
  getSalesOrderStateBadgeVariant,
} from "@/features/sales-orders/utils/sales-order-status";

const STATE_ICONS: Record<string, LucideIcon> = {
  draft: FileEdit,
  sent: Send,
  sale: CheckCircle2,
  done: Lock,
  cancel: Ban,
};

const INVOICE_STATUS_ICONS: Record<string, LucideIcon> = {
  no: FileEdit,
  "to invoice": Clock,
  invoiced: CheckCircle2,
  upselling: CircleDollarSign,
};

type SalesOrderStateBadgeProps = {
  state: SalesOrderState;
  className?: string;
};

export function SalesOrderStateBadge({
  state,
  className,
}: SalesOrderStateBadgeProps) {
  const normalized = String(state || "").toLowerCase();
  const variant = getSalesOrderStateBadgeVariant(state);
  const icon = STATE_ICONS[normalized] ?? FileEdit;

  return (
    <StatusPill
      label={formatSalesOrderStateLabel(state)}
      variant={normalizeSalesOrderVariant(variant)}
      icon={icon}
      className={className}
    />
  );
}

type SalesOrderInvoiceStatusBadgeProps = {
  status: SalesOrderInvoiceStatus;
  className?: string;
};

export function SalesOrderInvoiceStatusBadge({
  status,
  className,
}: SalesOrderInvoiceStatusBadgeProps) {
  const normalized = String(status || "").toLowerCase();
  const variant = getSalesOrderInvoiceStatusBadgeVariant(status);
  const icon = INVOICE_STATUS_ICONS[normalized] ?? FileEdit;

  return (
    <StatusPill
      label={formatSalesOrderInvoiceStatusLabel(status)}
      variant={normalizeSalesOrderVariant(variant)}
      icon={icon}
      className={className}
    />
  );
}

function normalizeSalesOrderVariant(
  variant: ReturnType<typeof getSalesOrderStateBadgeVariant>,
): StatusPillVariant {
  if (variant === "secondary") {
    return "outline";
  }
  return variant;
}

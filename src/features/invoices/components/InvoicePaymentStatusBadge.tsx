"use client";

import { Badge } from "@/components/ui/badge";
import type { InvoicePaymentStatus } from "@/features/invoices/types/invoice.types";
import { formatInvoicePaymentStatusLabel } from "@/features/invoices/utils/invoice-payment-status";
import { cn } from "@/lib/utils";

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "outline" | "destructive" | "success"
> = {
  not_paid: "destructive",
  partially_paid: "secondary",
  paid: "success",
  overpaid: "outline",
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
  return (
    <Badge
      variant={STATUS_VARIANTS[normalized] ?? "outline"}
      className={cn("font-normal", className)}
    >
      {formatInvoicePaymentStatusLabel(normalized)}
    </Badge>
  );
}

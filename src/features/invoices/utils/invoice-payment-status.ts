import type { InvoicePaymentStatus } from "@/features/invoices/types/invoice.types";

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  not_paid: "Not paid",
  partially_paid: "Partially paid",
  paid: "Paid",
  overpaid: "Overpaid",
};

export function formatInvoicePaymentStatusLabel(
  status: InvoicePaymentStatus | null | undefined,
): string {
  const normalized = String(status || "").toLowerCase();
  return PAYMENT_STATUS_LABELS[normalized] ?? "Unknown";
}

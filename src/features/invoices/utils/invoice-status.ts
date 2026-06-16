import type { InvoiceState } from "@/features/invoices/types/invoice.types";

export function formatInvoiceStateLabel(state: InvoiceState): string {
  const normalized = String(state || "").toLowerCase();
  if (!normalized) {
    return "Unknown";
  }
  return normalized.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

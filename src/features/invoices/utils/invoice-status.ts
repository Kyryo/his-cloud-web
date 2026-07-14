import type { InvoiceState } from "@/features/invoices/types/invoice.types";

export function formatInvoiceStateLabel(state: InvoiceState): string {
  const normalized = String(state || "").toLowerCase();
  if (!normalized) {
    return "Unknown";
  }
  if (normalized === "posted") {
    return "Invoiced";
  }
  return normalized.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getCancelInvoiceDisabledReason(
  invoice: Pick<
    { state: InvoiceState; can_cancel?: boolean; cancel_block_reason?: string | null },
    "state" | "can_cancel" | "cancel_block_reason"
  >,
): string | null {
  if (typeof invoice.can_cancel === "boolean") {
    if (invoice.can_cancel) {
      return null;
    }
    return (
      invoice.cancel_block_reason?.trim() || "This invoice cannot be cancelled."
    );
  }

  const state = String(invoice.state || "").toLowerCase();
  if (state === "cancel") {
    return "Invoice is already cancelled.";
  }
  if (state !== "posted") {
    return "Only posted invoices can be cancelled.";
  }
  return null;
}

export function canCancelInvoice(
  invoice: Pick<
    { state: InvoiceState; can_cancel?: boolean; cancel_block_reason?: string | null },
    "state" | "can_cancel" | "cancel_block_reason"
  >,
): boolean {
  return getCancelInvoiceDisabledReason(invoice) === null;
}

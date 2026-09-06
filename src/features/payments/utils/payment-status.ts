import type { PaymentState } from "@/features/payments/types/payment.types";

export function formatPaymentStateLabel(state: PaymentState): string {
  const normalized = String(state || "").toLowerCase();
  if (!normalized) {
    return "Unknown";
  }
  if (normalized === "cancel") {
    return "Cancelled";
  }
  return normalized.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

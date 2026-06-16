import type { Payment } from "@/features/payments/types/payment.types";
import { formatInvoiceAmount } from "@/features/invoices/utils/format-invoice";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";

export function formatPaymentCustomer(payment: Payment): string {
  return payment.customer_name?.trim() || "No customer";
}

export function formatPaymentDate(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }
  return formatDisplayDateTime(value);
}

export function formatPaymentAmount(
  value: string | number | null | undefined,
  currency = "MWK",
): string {
  return formatInvoiceAmount(value, currency);
}

export function formatPaymentMethod(value: string | null | undefined): string {
  return value?.trim() || "—";
}

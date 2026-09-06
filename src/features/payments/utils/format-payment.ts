import type { Payment } from "@/features/payments/types/payment.types";
import { formatInvoiceAmount } from "@/features/invoices/utils/format-invoice";
import {
  formatDisplayDate,
  formatDisplayDateTime,
} from "@/features/customers/utils/format-customer";
import { ROUTES } from "@/constants/routes";

export function formatPaymentCustomer(payment: Payment): string {
  return payment.customer_name?.trim() || "No customer";
}

export function formatPaymentDate(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }
  return formatDisplayDateTime(value);
}

export function formatPaymentDay(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }
  return formatDisplayDate(value);
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

export function formatPaymentAllocationLabel(payment: Payment): string {
  if (payment.applies_to_opening_balance) {
    return "Opening balance";
  }
  if (payment.invoice_name?.trim()) {
    return payment.invoice_name.trim();
  }
  if (payment.invoice_id) {
    return `#${payment.invoice_id}`;
  }
  return "—";
}

export function getPaymentAllocationHref(payment: Payment): string | null {
  if (payment.invoice_id || payment.invoice_uuid) {
    return ROUTES.invoiceDetail(payment.invoice_uuid ?? payment.invoice_id);
  }
  return null;
}

export function formatPaymentRecordedBy(payment: Payment): string | null {
  const name = payment.recorded_by_name?.trim();
  if (name) {
    return name;
  }
  const email = payment.recorded_by_email?.trim();
  return email || null;
}

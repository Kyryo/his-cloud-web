import type { Invoice } from "@/features/invoices/types/invoice.types";
import { formatSalesOrderAmount } from "@/features/sales-orders/utils/format-sales-order";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";

export function formatInvoiceCustomer(invoice: Invoice): string {
  return invoice.customer_name?.trim() || "No customer";
}

export function formatInvoiceDate(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }
  return formatDisplayDateTime(value);
}

export function formatInvoiceAmount(
  value: string | number | null | undefined,
  currency = "MWK",
): string {
  return formatSalesOrderAmount(value, currency);
}

export function formatInvoicePricelist(
  invoice: Pick<Invoice, "pricelist_name">,
): string {
  const trimmed = invoice.pricelist_name?.trim();
  return trimmed || "No pricelist";
}

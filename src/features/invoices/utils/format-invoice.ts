import type { Invoice } from "@/features/invoices/types/invoice.types";
import { formatSalesOrderAmount } from "@/features/sales-orders/utils/format-sales-order";
import { formatDisplayDate } from "@/features/customers/utils/format-customer";

export function formatInvoiceCustomer(invoice: Invoice): string {
  return invoice.customer_name?.trim() || "No customer";
}

function parseInvoiceDate(value: string): Date | null {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (dateOnly) {
    const year = Number(dateOnly[1]);
    const month = Number(dateOnly[2]);
    const day = Number(dateOnly[3]);
    const date = new Date(year, month - 1, day);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

export function formatInvoiceDate(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  const date = parseInvoiceDate(value);
  if (!date) {
    return formatDisplayDate(value);
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
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

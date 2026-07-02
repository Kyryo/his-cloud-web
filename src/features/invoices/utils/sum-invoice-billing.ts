import { hasLinePaymentSplit } from "@/features/sales-orders/types/line-payment-split.types";
import type { Invoice, InvoiceLine } from "@/features/invoices/types/invoice.types";

type BillableLineField = "insurer_due" | "client_due";

function sumLineField(
  lines: InvoiceLine[] | undefined,
  field: BillableLineField,
): number {
  if (!lines?.length) {
    return 0;
  }

  return lines.reduce((total, line) => {
    const value = Number(line[field] ?? 0);
    return total + (Number.isFinite(value) ? value : 0);
  }, 0);
}

export function sumInvoiceInsurerDue(invoice: Invoice): number {
  return sumLineField(invoice.lines, "insurer_due");
}

export function sumInvoiceClientDue(invoice: Invoice): number {
  return sumLineField(invoice.lines, "client_due");
}

export function sumInvoiceExcess(invoice: Invoice): number {
  if (!invoice.lines?.length) {
    return 0;
  }

  return invoice.lines.reduce((total, line) => {
    const value = Number(line.excess_amount ?? 0);
    if (!line.has_excess || !Number.isFinite(value)) {
      return total;
    }
    return total + value;
  }, 0);
}

export function hasInvoicePaymentSplit(invoice: Invoice): boolean {
  return (invoice.lines ?? []).some((line) => hasLinePaymentSplit(line));
}

export function formatInvoiceInsurerDueLabel(invoice: Invoice): string {
  const company = invoice.insurance_company?.trim() ?? "";
  const scheme = invoice.insurance_scheme_name?.trim() ?? "";

  if (company) {
    return `${company} due`;
  }

  if (scheme) {
    return `${scheme} due`;
  }

  return "Insurance due";
}

export function hasInvoiceBalance(invoice: Invoice): boolean {
  const balance = Number(invoice.amount_residual ?? 0);
  return Number.isFinite(balance) && balance > 0;
}

import type { InvoiceLine } from "@/features/invoices/types/invoice.types";

export function isInvoiceLineNonPayable(line: Pick<InvoiceLine, "is_payable">): boolean {
  return line.is_payable === false;
}

export function getInvoiceClaimableLines(
  lines: InvoiceLine[] | undefined,
): InvoiceLine[] {
  return (lines ?? []).filter((line) => line.is_payable);
}

export function getInvoiceNonPayableLines(
  lines: InvoiceLine[] | undefined,
): InvoiceLine[] {
  return (lines ?? []).filter((line) => !line.is_payable);
}

export function invoiceHasNonPayableLines(lines: InvoiceLine[] | undefined): boolean {
  return getInvoiceNonPayableLines(lines).length > 0;
}

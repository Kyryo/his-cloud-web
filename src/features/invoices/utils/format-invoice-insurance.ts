import type { Invoice } from "@/features/invoices/types/invoice.types";
import { formatOptionalString } from "@/features/sales-orders/utils/format-sales-order";

export function formatInvoiceInsuranceLabel(invoice: Invoice): string {
  const company = invoice.insurance_company?.trim() ?? "";
  const scheme = invoice.insurance_scheme_name?.trim() ?? "";

  if (company && scheme) {
    return `${company} - ${scheme}`;
  }

  if (company) {
    return company;
  }

  if (scheme) {
    return scheme;
  }

  return "—";
}

export function formatInvoiceInsuranceNumber(invoice: Invoice): string {
  const prefix = invoice.insurance_number_prefix?.trim() ?? "";
  const number = invoice.insurance_number?.trim() ?? "";

  if (prefix && number) {
    return `${prefix}${number}`;
  }

  if (number) {
    return number;
  }

  return formatOptionalString(null);
}

import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import { formatOptionalString } from "@/features/sales-orders/utils/format-sales-order";

export function formatSalesOrderInsuranceLabel(order: SalesOrder): string {
  const company = order.insurance_company?.trim() ?? "";
  const scheme = order.insurance_scheme_name?.trim() ?? "";

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

export function formatSalesOrderInsuranceNumber(order: SalesOrder): string {
  const prefix = order.insurance_number_prefix?.trim() ?? "";
  const number = order.insurance_number?.trim() ?? "";

  if (prefix && number) {
    return `${prefix}${number}`;
  }

  if (number) {
    return number;
  }

  return formatOptionalString(null);
}

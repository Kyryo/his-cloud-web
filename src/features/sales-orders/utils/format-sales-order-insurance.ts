import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import {
  formatOdooCustomField,
  isEmptyOdooCustomField,
} from "@/features/sales-orders/utils/format-odoo-custom-field";

export function formatSalesOrderInsuranceLabel(order: SalesOrder): string {
  const company = isEmptyOdooCustomField(order.x_insurance_company)
    ? ""
    : String(order.x_insurance_company).trim();
  const scheme = isEmptyOdooCustomField(order.x_insurance_scheme_name)
    ? ""
    : String(order.x_insurance_scheme_name).trim();

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
  const prefix = formatOdooCustomField(order.x_insurance_number_prefix, "");
  const number = formatOdooCustomField(order.x_insurance_number, "");

  if (prefix && number && prefix !== "—" && number !== "—") {
    return `${prefix}${number}`;
  }

  if (number && number !== "—") {
    return number;
  }

  return "—";
}

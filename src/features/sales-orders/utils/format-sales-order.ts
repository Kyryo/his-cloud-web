import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";
import {
  formatOdooCustomField,
  isEmptyOdooCustomField,
} from "@/features/sales-orders/utils/format-odoo-custom-field";
import { formatOdooRelation } from "@/features/sales-orders/utils/format-odoo-relation";

export function formatSalesOrderCustomer(order: SalesOrder): string {
  const label = formatOdooRelation(order.partner_id);
  return label === "—" ? "No customer" : label;
}

export function formatSalesOrderClinicName(
  order: Pick<SalesOrder, "clinic_name" | "x_clinic_name">,
): string {
  const clinicName = !isEmptyOdooCustomField(order.x_clinic_name)
    ? order.x_clinic_name
    : order.clinic_name;

  return formatOdooCustomField(clinicName, "No clinic");
}

export function formatSalesOrderPricelist(
  order: Pick<SalesOrder, "pricelist_id">,
): string {
  const label = formatOdooRelation(order.pricelist_id);
  return label === "—" ? "No pricelist" : label;
}

export function formatSalesOrderAmount(
  value: string | number | null | undefined,
  currencyLabel?: string,
): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return String(value);
  }

  const formatted = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return currencyLabel ? `${formatted} ${currencyLabel}` : formatted;
}

export function formatSalesOrderCurrency(order: SalesOrder): string | undefined {
  const label = formatOdooRelation(order.currency_id);
  return label === "—" ? undefined : label;
}

export function formatSalesOrderDateTime(
  value: string | null | undefined,
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatSalesOrderDate(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    date,
  );
}

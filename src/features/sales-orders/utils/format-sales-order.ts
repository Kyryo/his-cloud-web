import { formatOdooRelation } from "@/features/sales-orders/utils/format-odoo-relation";
import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";

export function formatSalesOrderCustomer(order: SalesOrder): string {
  return formatOdooRelation(order.partner_id);
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

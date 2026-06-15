import type { SalesOrder } from "@/features/sales-orders/types/sales-order.types";

export function formatOptionalString(
  value: string | number | null | undefined,
  emptyLabel = "—",
): string {
  if (value === null || value === undefined) {
    return emptyLabel;
  }

  const trimmed = String(value).trim();
  return trimmed || emptyLabel;
}

export function formatSalesOrderCustomer(order: SalesOrder): string {
  return formatOptionalString(order.customer_name, "No customer");
}

export function formatSalesOrderClinicName(
  order: Pick<SalesOrder, "clinic_name">,
): string {
  return formatOptionalString(order.clinic_name, "No clinic");
}

export function formatSalesOrderPricelist(
  order: Pick<SalesOrder, "pricelist_name">,
): string {
  return formatOptionalString(order.pricelist_name, "No pricelist");
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
  const code = order.currency_code?.trim();
  return code || undefined;
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

import type { SalesOrder, SalesOrderLine } from "@/features/sales-orders/types/sales-order.types";

type BillableLineField = "insurer_due" | "client_due";

function sumLineField(
  lines: SalesOrderLine[] | undefined,
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

export function sumSalesOrderInsurerDue(order: SalesOrder): number {
  return sumLineField(order.lines, "insurer_due");
}

export function sumSalesOrderClientDue(order: SalesOrder): number {
  return sumLineField(order.lines, "client_due");
}

export function formatSalesOrderInsurerDueLabel(order: SalesOrder): string {
  const company = order.insurance_company?.trim() ?? "";
  const scheme = order.insurance_scheme_name?.trim() ?? "";

  if (company) {
    return `${company} due`;
  }

  if (scheme) {
    return `${scheme} due`;
  }

  return "Insurance due";
}

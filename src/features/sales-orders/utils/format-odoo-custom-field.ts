import type { OdooCustomFieldValue } from "@/features/sales-orders/types/sales-order.types";

export function isEmptyOdooCustomField(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    value === false ||
    (typeof value === "string" && value.trim() === "")
  );
}

export function formatOdooCustomField(
  value: OdooCustomFieldValue | unknown,
  emptyLabel: string,
): string {
  if (isEmptyOdooCustomField(value)) {
    return emptyLabel;
  }

  return String(value).trim();
}

export function getOdooCustomFieldString(
  value: OdooCustomFieldValue | unknown,
): string | null {
  if (isEmptyOdooCustomField(value)) {
    return null;
  }

  return String(value).trim();
}

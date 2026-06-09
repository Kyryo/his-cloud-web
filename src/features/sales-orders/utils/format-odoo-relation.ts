import type { OdooRelation } from "@/features/sales-orders/types/sales-order.types";

export function formatOdooRelation(
  value: OdooRelation | false | null | unknown,
): string {
  if (Array.isArray(value) && value.length >= 2) {
    return String(value[1]);
  }

  return "—";
}

export function getOdooRelationId(
  value: OdooRelation | false | null | unknown,
): number | null {
  if (Array.isArray(value) && value.length >= 1) {
    const id = Number(value[0]);
    return Number.isFinite(id) ? id : null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  return null;
}

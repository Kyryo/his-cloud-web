import type { LabOrderItem } from "@/features/laboratory/types/laboratory.types";

/** Stable display order for lab order items (panel membership / sort_order). */
export function sortLabOrderItems<T extends Pick<LabOrderItem, "sort_order">>(
  items: readonly T[],
): T[] {
  return [...items].sort((left, right) => left.sort_order - right.sort_order);
}

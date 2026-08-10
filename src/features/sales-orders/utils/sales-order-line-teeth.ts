import type {
  SalesOrder,
  SalesOrderLine,
} from "@/features/sales-orders/types/sales-order.types";

export function salesOrderLineHasTeeth(line: SalesOrderLine): boolean {
  return (line.dental ?? []).some((row) => Number(row.tooth_number) > 0);
}

/**
 * After a save, return newly persisted procedure lines on a dental visit that
 * still need tooth assignment.
 */
export function findSalesOrderLinesNeedingTeethAssignment(options: {
  order: SalesOrder;
  previousLineIds: Iterable<number>;
}): SalesOrderLine[] {
  const { order, previousLineIds } = options;
  if (!order.has_dental_encounter) {
    return [];
  }

  const prior = new Set(previousLineIds);
  return (order.lines ?? []).filter(
    (line) =>
      Boolean(line.is_procedure) &&
      !prior.has(line.id) &&
      !salesOrderLineHasTeeth(line),
  );
}

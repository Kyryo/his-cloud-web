export function remainingQuantity(
  ordered: string | number,
  dispensed: string | number,
): number {
  return Number(ordered) - Number(dispensed);
}

export function formatDispensationQuantity(value: string | number): string {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return String(value);
  }
  return numeric.toLocaleString(undefined, {
    maximumFractionDigits: 4,
  });
}

export function isLineFullyDispensed(line: {
  quantity: string | number;
  dispensed_quantity: string | number;
}): boolean {
  return remainingQuantity(line.quantity, line.dispensed_quantity) <= 0;
}

export type PharmacyQueueDispenseStatus =
  | "waiting"
  | "partial"
  | "complete";

export function getPharmacyQueueDispenseStatus(item: {
  dispensable_line_count: number;
  remaining_line_count: number;
}): PharmacyQueueDispenseStatus {
  if (item.remaining_line_count <= 0) {
    return "complete";
  }
  if (item.remaining_line_count >= item.dispensable_line_count) {
    return "waiting";
  }
  return "partial";
}

export function formatPharmacyQueueDispenseStatusLabel(
  status: PharmacyQueueDispenseStatus,
): string {
  switch (status) {
    case "waiting":
      return "Waiting";
    case "partial":
      return "Partial";
    case "complete":
      return "Complete";
  }
}

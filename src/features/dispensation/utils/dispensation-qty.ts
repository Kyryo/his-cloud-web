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

export function getLineDispenseStatus(line: {
  quantity: string | number;
  dispensed_quantity: string | number;
}): PharmacyQueueDispenseStatus {
  if (isLineFullyDispensed(line)) {
    return "complete";
  }
  if (Number(line.dispensed_quantity) <= 0) {
    return "waiting";
  }
  return "partial";
}

export type QueueLineSummary = {
  lineCount: number;
  remainingLineCount: number;
  orderedQuantity: number;
  dispensedQuantity: number;
  remainingQuantity: number;
  status: PharmacyQueueDispenseStatus;
  progressPercent: number;
};

export function summarizeQueueLines(
  lines: readonly {
    quantity: string | number;
    dispensed_quantity: string | number;
  }[],
): QueueLineSummary {
  let remainingLineCount = 0;
  let orderedQuantity = 0;
  let dispensedQuantity = 0;

  for (const line of lines) {
    orderedQuantity += Number(line.quantity) || 0;
    dispensedQuantity += Number(line.dispensed_quantity) || 0;
    if (!isLineFullyDispensed(line)) {
      remainingLineCount += 1;
    }
  }

  const remainingQuantity = Math.max(0, orderedQuantity - dispensedQuantity);
  const progressPercent =
    orderedQuantity > 0
      ? Math.min(100, Math.round((dispensedQuantity / orderedQuantity) * 100))
      : 0;

  return {
    lineCount: lines.length,
    remainingLineCount,
    orderedQuantity,
    dispensedQuantity,
    remainingQuantity,
    status: getPharmacyQueueDispenseStatus({
      dispensable_line_count: lines.length,
      remaining_line_count: remainingLineCount,
    }),
    progressPercent,
  };
}

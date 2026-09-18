import type {
  LabOrder,
  LabOrderPriority,
  LabOrderStatus,
} from "@/features/laboratory/types/laboratory.types";

export function shortenUuid(uuid: string | null | undefined, length = 8): string {
  if (!uuid) {
    return "—";
  }
  return uuid.slice(0, length);
}

export function formatLabOrderStatusLabel(status: string | undefined): string {
  switch (status) {
    case "ORDERED":
      return "Ordered";
    case "COLLECTING":
      return "Collecting";
    case "IN_LAB":
      return "In lab";
    case "PARTIAL":
      return "Partial";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status || "Unknown";
  }
}

export function formatLabOrderPriorityLabel(priority: string | undefined): string {
  switch (priority) {
    case "ROUTINE":
      return "Routine";
    case "URGENT":
      return "Urgent";
    case "STAT":
      return "STAT";
    default:
      return priority || "—";
  }
}

export function formatLabDisplayDateTime(value: string | null | undefined): string {
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

export function formatLabAccession(order: LabOrder): string {
  return order.accession_number?.trim() || "Not accessioned";
}

export function canCollectSpecimen(status: LabOrderStatus | string): boolean {
  return status === "ORDERED" || status === "COLLECTING";
}

export function canAccessionOrder(status: LabOrderStatus | string): boolean {
  return status === "COLLECTING" || status === "ORDERED" || status === "IN_LAB";
}

export function canCancelLabOrder(status: LabOrderStatus | string): boolean {
  return status !== "CANCELLED" && status !== "COMPLETED";
}

export function isUrgentPriority(priority: LabOrderPriority | string): boolean {
  return priority === "URGENT" || priority === "STAT";
}

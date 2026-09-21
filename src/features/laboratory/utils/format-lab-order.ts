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

/**
 * Relative ordered-at label for list rows, e.g. "9 min ago" or "1h 20min ago".
 */
export function formatLabOrderedRelative(
  value: string | null | undefined,
  now: Date = new Date(),
): string {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const minuteMs = 60_000;
  const hourMs = 60 * minuteMs;
  const dayMs = 24 * hourMs;

  if (diffMs < minuteMs) {
    return "Just now";
  }

  if (diffMs < hourMs) {
    const minutes = Math.floor(diffMs / minuteMs);
    return `${minutes} min ago`;
  }

  if (diffMs < dayMs) {
    const hours = Math.floor(diffMs / hourMs);
    const minutes = Math.floor((diffMs % hourMs) / minuteMs);
    if (minutes === 0) {
      return `${hours}h ago`;
    }
    return `${hours}h ${minutes}min ago`;
  }

  const days = Math.floor(diffMs / dayMs);
  if (days === 1) {
    return "Yesterday";
  }
  if (days < 7) {
    return `${days} days ago`;
  }

  return formatLabDisplayDateTime(value);
}

export function formatLabAccession(order: LabOrder): string {
  return order.accession_number?.trim() || "Not accessioned";
}

export function formatLabPatientName(order: LabOrder): string {
  const name = order.customer_name?.trim();
  if (name) {
    return name;
  }
  const identifier = order.customer_identifier?.trim();
  if (identifier) {
    return identifier;
  }
  return "Unknown patient";
}

export function formatLabOrderItemStatusLabel(status: string | undefined): string {
  switch (status) {
    case "ORDERED":
      return "Ordered";
    case "SPECIMEN_PENDING":
      return "Specimen pending";
    case "IN_PROGRESS":
      return "In progress";
    case "RESULTED":
      return "Resulted";
    case "RELEASED":
      return "Released";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status || "—";
  }
}

export function formatLabResultStatusLabel(
  status: string | null | undefined,
): string {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "ENTERED":
      return "Entered";
    case "VERIFIED":
      return "Verified";
    case "RELEASED":
      return "Released";
    case "REJECTED":
      return "Rejected";
    default:
      return status || "—";
  }
}

export function formatLabSpecimenStatusLabel(status: string | undefined): string {
  switch (status) {
    case "COLLECTED":
      return "Collected";
    case "ACCESSIONED":
      return "Accessioned";
    case "REJECTED":
      return "Rejected";
    default:
      return status || "—";
  }
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

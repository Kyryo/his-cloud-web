import type { EncounterClinicalOrder } from "@/features/clinical-opd/types/clinical-opd.types";

const ORDER_TYPE_LABELS: Record<string, string> = {
  LABORATORY: "Lab",
  RADIOLOGY: "Radiology",
  PROCEDURE: "Procedure",
  SUNDRY: "Sundry",
  MEDICATION: "Medication",
  TREATMENT: "Treatment",
  CONSULTATION: "Consultation",
  SUPPLY: "Supply",
  OTHER: "Clinical",
};

/** Lab LIS workflow statuses shown in the Activity aside. */
const LAB_STATUS_NARRATION: Record<string, string> = {
  ORDERED: "ordered",
  COLLECTING: "collecting",
  IN_LAB: "in lab",
  PARTIAL: "partially submitted",
  COMPLETED: "released",
  CANCELLED: "cancelled",
};

export type OpdActivityOrderStatusRow = {
  /** Left-side label, e.g. "Lab orders". */
  label: string;
  /** Right-side status text, e.g. "partially submitted". */
  status: string;
  /** Stable key for list rendering. */
  key: string;
};

export type OpdActivityOrderStatusBadgeVariant =
  | "secondary"
  | "outline"
  | "warning"
  | "success"
  | "destructive";

/**
 * Friendly status wording for non-lab clinical orders.
 * Radiology will get its own workflow status mapping later.
 */
function clinicalStatusNarration(status: string): string {
  const normalizedStatus = (status || "").toUpperCase();

  switch (normalizedStatus) {
    case "DRAFT":
      return "drafted";
    case "ORDERED":
      return "ordered";
    case "IN_PROGRESS":
      return "in progress";
    case "REFERRED":
      return "referred";
    case "COMPLETED":
      return "completed";
    case "CANCELLED":
      return "cancelled";
    default:
      return (status || "updated").toLowerCase().replaceAll("_", " ");
  }
}

function labStatusNarration(
  labStatus: string | null | undefined,
  fallbackStatus: string,
): string {
  const normalized = (labStatus || "").toUpperCase();
  if (normalized && LAB_STATUS_NARRATION[normalized]) {
    return LAB_STATUS_NARRATION[normalized];
  }
  if (normalized) {
    return normalized.toLowerCase().replaceAll("_", " ");
  }
  return clinicalStatusNarration(fallbackStatus);
}

function typeLabel(itemType: string, itemTypeDisplay?: string): string {
  const normalized = (itemType || "").toUpperCase();
  return ORDER_TYPE_LABELS[normalized] || itemTypeDisplay || "Clinical";
}

function statusForOrder(order: EncounterClinicalOrder): string {
  const itemType = (order.item_type || "").toUpperCase();
  const visitStatus = (order.status || "").toUpperCase();
  if (visitStatus === "REFERRED") {
    return "referred";
  }
  if (itemType === "LABORATORY") {
    return labStatusNarration(order.lab_status, order.status);
  }
  return clinicalStatusNarration(order.status);
}

/** Capitalize status for badge display (e.g. "in lab" → "In lab"). */
export function formatOpdActivityOrderStatusLabel(status: string): string {
  const trimmed = status.trim();
  if (!trimmed) {
    return trimmed;
  }
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function opdActivityOrderStatusBadgeVariant(
  status: string,
): OpdActivityOrderStatusBadgeVariant {
  switch (status.toLowerCase()) {
    case "partial":
    case "partially submitted":
    case "collecting":
    case "in progress":
      return "warning";
    case "released":
    case "completed":
      return "success";
    case "cancelled":
      return "destructive";
    case "referred":
      return "warning";
    case "ordered":
    case "drafted":
      return "outline";
    case "in lab":
    default:
      return "secondary";
  }
}

/**
 * Aggregate encounter orders into status rows without listing
 * individual products/tests — e.g. label "Lab orders", status "partially submitted".
 */
export function buildOpdActivityOrderStatusRows(
  orders: EncounterClinicalOrder[],
): OpdActivityOrderStatusRow[] {
  const active = orders.filter((order) => order.is_active !== false);
  if (active.length === 0) {
    return [];
  }

  const counts = new Map<string, OpdActivityOrderStatusRow>();

  for (const order of active) {
    const type = typeLabel(order.item_type, order.item_type_display);
    const status = statusForOrder(order);
    const key = `${type.toLowerCase()}|${status}`;
    if (!counts.has(key)) {
      counts.set(key, {
        key,
        label: `${type} orders`,
        status,
      });
    }
  }

  return Array.from(counts.values()).sort((left, right) => {
    const byLabel = left.label.localeCompare(right.label);
    if (byLabel !== 0) {
      return byLabel;
    }
    return left.status.localeCompare(right.status);
  });
}

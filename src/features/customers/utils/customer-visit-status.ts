import type { CustomerVisitStatus } from "@/features/customers/types/customer-visit-status.types";

export function isCustomerVisitActive(
  status: CustomerVisitStatus | string | undefined,
): boolean {
  return status === "active";
}

export function formatCustomerVisitStatusLabel(
  status: CustomerVisitStatus | string | undefined,
): string {
  switch (status) {
    case "active":
      return "Active";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    case "not_started":
    default:
      return "Not started";
  }
}

export function normalizeCustomerVisitStatus(
  status: string | undefined,
): CustomerVisitStatus {
  if (
    status === "active" ||
    status === "completed" ||
    status === "cancelled" ||
    status === "not_started"
  ) {
    return status;
  }

  return "not_started";
}

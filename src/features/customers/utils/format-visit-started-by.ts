import type { CustomerVisit } from "@/features/customers/types/customer-visit.types";

export function formatVisitStartedBy(visit: CustomerVisit): string {
  const name = visit.created_by_name?.trim();
  if (name) {
    return name;
  }

  const email = visit.created_by_email?.trim();
  if (email) {
    return email;
  }

  return "—";
}

import type { CustomerVisit } from "@/features/customers/types/customer-visit.types";

export function formatVisitPaymentLabel(visit: CustomerVisit): string {
  return visit.mode_of_payment === "insurance" ? "Insurance" : "Cash";
}

export function formatVisitSchemeLabel(visit: CustomerVisit): string {
  if (visit.mode_of_payment !== "insurance") {
    return "—";
  }

  const payer = visit.insurance_company_name?.trim() ?? "";
  const scheme = visit.insurance_scheme_name?.trim() ?? "";

  if (payer && scheme) {
    return `${payer} - ${scheme}`;
  }

  return scheme || payer || "—";
}

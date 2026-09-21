import type { VisitDetail } from "@/features/visits/types/visit.types";

export type VisitModeOfPayment = VisitDetail["mode_of_payment"];

export function formatVisitPaymentModeLabel(
  visit: Pick<VisitDetail, "mode_of_payment" | "insurance_scheme_name">,
): string {
  const modeLabel =
    visit.mode_of_payment === "insurance"
      ? "Insurance"
      : visit.mode_of_payment === "free"
        ? "Free"
        : "Cash";

  if (visit.mode_of_payment === "insurance" && visit.insurance_scheme_name) {
    return `${modeLabel} · ${visit.insurance_scheme_name}`;
  }

  return modeLabel;
}

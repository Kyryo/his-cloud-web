import type { VisitMemberBenefit } from "@/features/visits/types/visit.types";

export function formatBenefitBalance(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return String(value);
  }
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function benefitLabel(benefit: VisitMemberBenefit): string {
  const name = benefit.benefitName;
  if (typeof name === "string" && name.trim()) {
    return name.trim();
  }
  const externalId = benefit.externalBenefitId;
  if (externalId !== null && externalId !== undefined) {
    return `Benefit ${externalId}`;
  }
  return "Benefit";
}

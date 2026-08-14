import type { InsuranceScheme } from "@/features/customers/types/customer-insurance.types";

export function formatInsuranceSchemeLabel(
  scheme: Pick<InsuranceScheme, "name" | "insurance_company_name">,
): string {
  const schemeName = scheme.name.trim();
  const payerName = scheme.insurance_company_name.trim();

  if (
    !payerName ||
    payerName.localeCompare(schemeName, undefined, { sensitivity: "accent" }) ===
      0
  ) {
    return schemeName;
  }

  return `${payerName}-${schemeName}`;
}

export type InsurancePayerOption = {
  id: number;
  name: string;
};

export const VISIBLE_PAYER_BADGE_LIMIT = 4;

export function uniqueInsurancePayers(
  schemes: Pick<
    InsuranceScheme,
    "insurance_company" | "insurance_company_name"
  >[],
): InsurancePayerOption[] {
  const byId = new Map<number, InsurancePayerOption>();

  for (const scheme of schemes) {
    if (byId.has(scheme.insurance_company)) {
      continue;
    }

    const name =
      scheme.insurance_company_name.trim() || `Payer ${scheme.insurance_company}`;
    byId.set(scheme.insurance_company, {
      id: scheme.insurance_company,
      name,
    });
  }

  return [...byId.values()].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}

export function splitVisibleInsurancePayers(
  payers: InsurancePayerOption[],
  options: {
    expanded: boolean;
    selectedPayerId: number | null;
    visibleLimit?: number;
  },
): { visible: InsurancePayerOption[]; overflow: InsurancePayerOption[] } {
  const limit = options.visibleLimit ?? VISIBLE_PAYER_BADGE_LIMIT;

  if (payers.length <= limit) {
    return { visible: payers, overflow: [] };
  }

  const primary = payers.slice(0, limit);
  const remainder = payers.slice(limit);

  if (options.expanded) {
    return { visible: primary, overflow: remainder };
  }

  const selected = options.selectedPayerId
    ? remainder.find((payer) => payer.id === options.selectedPayerId)
    : null;

  if (!selected) {
    return { visible: primary, overflow: remainder };
  }

  const visible = [...primary.slice(0, limit - 1), selected];
  const overflow = payers.filter(
    (payer) => !visible.some((item) => item.id === payer.id),
  );

  return { visible, overflow };
}

export function formatMorePayersLabel(hiddenCount: number): string {
  return hiddenCount === 1
    ? "1 more payer"
    : `${hiddenCount} more payers`;
}

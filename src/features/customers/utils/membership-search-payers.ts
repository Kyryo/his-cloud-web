import type { OrganizationPayer } from "@/features/settings/types/settings.types";

export type MembershipSearchPayer = {
  id: string;
  name: string;
  payerCode: string;
};

const MEMBER_SEARCH = "member_search";

export function membershipSearchPayers(
  payers: OrganizationPayer[],
): MembershipSearchPayer[] {
  const seen = new Set<string>();
  const results: MembershipSearchPayer[] = [];

  for (const payer of payers) {
    if (!payer.is_active) {
      continue;
    }
    const registry = payer.registry_payer_detail;
    if (!registry || registry.status !== "approved" || registry.is_active !== true) {
      continue;
    }
    if (!(registry.capabilities ?? []).includes(MEMBER_SEARCH)) {
      continue;
    }
    if (seen.has(registry.uuid)) {
      continue;
    }
    const payerCode = (registry.integration_code || registry.code).trim();
    if (!payerCode) {
      continue;
    }
    seen.add(registry.uuid);
    results.push({
      id: registry.uuid,
      name: registry.display_name || payer.name,
      payerCode,
    });
  }

  return results;
}

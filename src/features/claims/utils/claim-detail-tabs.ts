import type { ClaimDetail } from "@/features/claims/types/claims.types";
import { shouldShowClaimOdontogramTab } from "@/features/claims/utils/claim-odontogram-tab";

export const CLAIM_DETAIL_TABS = [
  "claim",
  "items",
  "odontogram",
  "reference",
  "activity",
] as const;

export type ClaimDetailTabId = (typeof CLAIM_DETAIL_TABS)[number];

export const CLAIM_DETAIL_TAB_LABELS: Record<ClaimDetailTabId, string> = {
  claim: "Claim",
  items: "Claimed items",
  odontogram: "Odontogram",
  reference: "Reference",
  activity: "Activity",
};

/** Maps the child route segment under `/claims/[claimId]` to a tab. */
export function claimDetailTabFromSegment(
  segment: string | null | undefined,
): ClaimDetailTabId {
  return CLAIM_DETAIL_TABS.find((tab) => tab !== "claim" && tab === segment) ?? "claim";
}

export function visibleClaimDetailTabs(
  claim: Pick<ClaimDetail, "has_dental_encounter">,
): ClaimDetailTabId[] {
  const showOdontogram = shouldShowClaimOdontogramTab(claim);
  return CLAIM_DETAIL_TABS.filter((tab) => tab !== "odontogram" || showOdontogram);
}

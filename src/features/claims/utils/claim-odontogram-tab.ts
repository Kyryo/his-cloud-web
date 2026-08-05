import type { ClaimDetail } from "@/features/claims/types/claims.types";

export function shouldShowClaimOdontogramTab(
  claim: Pick<ClaimDetail, "has_dental_encounter"> | { has_dental_encounter?: boolean },
): boolean {
  return Boolean(claim.has_dental_encounter);
}

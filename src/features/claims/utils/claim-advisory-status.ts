import type { ClaimDetail } from "@/features/claims/types/claims.types";

export function isClaimAdvisoryProcessing(
  claim: Pick<ClaimDetail, "advisory_status" | "latest_advisor_evaluation"> | null,
): boolean {
  const status = resolveClaimAdvisoryStatus(claim);
  return status === "pending" || status === "processing";
}

export function resolveClaimAdvisoryStatus(
  claim: Pick<ClaimDetail, "advisory_status" | "latest_advisor_evaluation"> | null,
): string {
  if (!claim) {
    return "pending";
  }
  if (claim.advisory_status) {
    return claim.advisory_status;
  }
  if (claim.latest_advisor_evaluation) {
    return "completed";
  }
  return "pending";
}

export function isClaimReadyToSubmit(claim: ClaimDetail): boolean {
  if (String(claim.status).toLowerCase() !== "draft") {
    return false;
  }
  if (isClaimAdvisoryProcessing(claim)) {
    return false;
  }
  if (resolveClaimAdvisoryStatus(claim) === "failed") {
    return false;
  }
  return !(
    Boolean(claim.has_blocking_advisories) && !claim.has_advisory_override
  );
}

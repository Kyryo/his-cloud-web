import type {
  ClaimAdvisoryStatusSnapshot,
  ClaimDetail,
} from "@/features/claims/types/claims.types";

type ClaimAdvisoryStatusFields = {
  advisory_status?: ClaimDetail["advisory_status"];
  latest_advisor_evaluation?:
    | Pick<
        NonNullable<ClaimDetail["latest_advisor_evaluation"]>,
        "status" | "id" | "deterministic_count" | "ai_count"
      >
    | ClaimDetail["latest_advisor_evaluation"]
    | null;
};

export function isClaimAdvisoryProcessing(
  claim: ClaimAdvisoryStatusFields | null,
): boolean {
  const status = resolveClaimAdvisoryStatus(claim);
  if (status === "pending" || status === "processing") {
    return true;
  }
  const evaluationStatus = claim?.latest_advisor_evaluation?.status;
  return (
    evaluationStatus === "pending_ai" &&
    status !== "completed" &&
    status !== "failed"
  );
}

export function isAdvisoryStatusSnapshotProcessing(
  snapshot: ClaimAdvisoryStatusSnapshot | null,
): boolean {
  return isClaimAdvisoryProcessing({
    advisory_status: snapshot?.advisory_status,
    latest_advisor_evaluation: snapshot?.latest_advisor_evaluation ?? null,
  });
}

export function resolveClaimAdvisoryStatus(
  claim: ClaimAdvisoryStatusFields | null,
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

export function mergeClaimWithAdvisoryStatus(
  claim: ClaimDetail,
  snapshot: ClaimAdvisoryStatusSnapshot,
): ClaimDetail {
  const latestSnapshot = snapshot.latest_advisor_evaluation;
  const currentEvaluation = claim.latest_advisor_evaluation;

  return {
    ...claim,
    advisory_status: snapshot.advisory_status ?? claim.advisory_status,
    has_blocking_advisories:
      snapshot.has_blocking_advisories ?? claim.has_blocking_advisories,
    has_advisory_override:
      snapshot.has_advisory_override ?? claim.has_advisory_override,
    latest_advisor_evaluation: latestSnapshot
      ? ({
          ...(currentEvaluation ?? {}),
          ...latestSnapshot,
        } as ClaimDetail["latest_advisor_evaluation"])
      : currentEvaluation,
  };
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

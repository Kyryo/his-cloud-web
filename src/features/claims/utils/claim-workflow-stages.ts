import type { ClaimDetail } from "@/features/claims/types/claims.types";
import { isClaimSubmitBlockedByAdvisories } from "@/features/claims/components/ClaimAdvisoriesPanel";
import {
  getBlockingRequirementItems,
  type InvoiceClaimReadinessItem,
} from "@/features/invoices/utils/invoice-claim-readiness";
import type { WorkflowStageStatus } from "@/components/ui/workflow-card";

export type ClaimWorkflowStageId =
  | "requirements"
  | "advisory"
  | "queue";

export type ClaimWorkflowStageState = {
  id: ClaimWorkflowStageId;
  status: WorkflowStageStatus;
  summary: string;
};

function requirementsState(
  requirementItems: InvoiceClaimReadinessItem[],
  claim: ClaimDetail | null,
): ClaimWorkflowStageState {
  const blockingItems = getBlockingRequirementItems(requirementItems);
  const unmet = blockingItems.filter((item) => !item.met);
  const allMet = unmet.length === 0;

  if (!allMet) {
    return {
      id: "requirements",
      status: "blocked",
      summary: `${unmet.length} of ${blockingItems.length} checks remaining`,
    };
  }

  if (claim) {
    return {
      id: "requirements",
      status: "completed",
      summary: `All ${blockingItems.length} checks passed`,
    };
  }

  return {
    id: "requirements",
    status: "current",
    summary: `All ${blockingItems.length} checks passed — create a draft claim`,
  };
}

function advisoryState(claim: ClaimDetail | null): ClaimWorkflowStageState {
  if (!claim) {
    return {
      id: "advisory",
      status: "pending",
      summary: "Available after the draft claim is created",
    };
  }

  const evaluation = claim.latest_advisor_evaluation ?? null;
  const findings = evaluation?.deterministic_findings ?? [];
  const blocked = isClaimSubmitBlockedByAdvisories(claim);
  const hasOverride = Boolean(claim.has_advisory_override);
  const statusLower = String(claim.status).toLowerCase();

  if (statusLower !== "draft" && statusLower !== "") {
    return {
      id: "advisory",
      status: "completed",
      summary: "Advisories reviewed before submission",
    };
  }

  if (!evaluation) {
    return {
      id: "advisory",
      status: "current",
      summary: "Run an evaluation against the payer rules",
    };
  }

  if (blocked) {
    const rejectionCount = findings.filter(
      (finding) => finding.severity === "rejection_risk",
    ).length;
    return {
      id: "advisory",
      status: "blocked",
      summary:
        rejectionCount > 0
          ? `${rejectionCount} rejection-risk finding${rejectionCount === 1 ? "" : "s"} must be resolved`
          : "Blocking findings must be resolved or overridden",
    };
  }

  if (hasOverride) {
    return {
      id: "advisory",
      status: "completed",
      summary: "Override recorded — submission is allowed",
    };
  }

  if (findings.length === 0) {
    return {
      id: "advisory",
      status: "completed",
      summary: "No advisory findings",
    };
  }

  const warningCount = findings.filter(
    (finding) => finding.severity === "warning",
  ).length;
  return {
    id: "advisory",
    status: "completed",
    summary:
      warningCount > 0
        ? `${warningCount} warning${warningCount === 1 ? "" : "s"} — submission is allowed`
        : `${findings.length} finding${findings.length === 1 ? "" : "s"} reviewed`,
  };
}

function queueState(claim: ClaimDetail | null): ClaimWorkflowStageState {
  if (!claim) {
    return {
      id: "queue",
      status: "pending",
      summary: "Available after requirements and advisories clear",
    };
  }

  const statusLower = String(claim.status).toLowerCase();
  if (statusLower === "submitted") {
    return {
      id: "queue",
      status: "completed",
      summary: "Claim submitted to the payer",
    };
  }
  if (statusLower === "approved") {
    return {
      id: "queue",
      status: "completed",
      summary: "Claim approved",
    };
  }
  if (statusLower === "rejected") {
    return {
      id: "queue",
      status: "failed",
      summary: "Claim was rejected by the payer",
    };
  }
  if (statusLower === "cancelled") {
    return {
      id: "queue",
      status: "failed",
      summary: "Claim was cancelled",
    };
  }

  if (isClaimSubmitBlockedByAdvisories(claim)) {
    return {
      id: "queue",
      status: "pending",
      summary: "Resolve advisory blockers before queuing",
    };
  }

  if (statusLower === "draft") {
    return {
      id: "queue",
      status: "current",
      summary: "Ready to submit to the payer",
    };
  }

  return {
    id: "queue",
    status: "pending",
    summary: "Waiting for earlier stages",
  };
}

/**
 * Derive the three claim workflow stage statuses from requirement checks + claim state.
 */
export function getClaimWorkflowStageStates(
  requirementItems: InvoiceClaimReadinessItem[],
  claim: ClaimDetail | null,
): ClaimWorkflowStageState[] {
  return [
    requirementsState(requirementItems, claim),
    advisoryState(claim),
    queueState(claim),
  ];
}

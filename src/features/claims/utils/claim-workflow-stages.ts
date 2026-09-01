import type { ClaimDetail } from "@/features/claims/types/claims.types";
import { isClaimSubmitBlockedByAdvisories } from "@/features/claims/components/ClaimAdvisoriesPanel";
import { asAdvisorFindings, isAdvisorFindingCleared } from "@/features/claims/utils/advisor-findings";
import {
  isClaimAdvisoryProcessing,
  resolveClaimAdvisoryStatus,
} from "@/features/claims/utils/claim-advisory-status";
import {
  getBlockingRequirementItems,
  type InvoiceClaimReadinessItem,
} from "@/features/invoices/utils/invoice-claim-readiness";
import type { WorkflowStageStatus } from "@/components/ui/workflow-card";

export type ClaimWorkflowStageId =
  | "requirements"
  | "advisory"
  | "queue"
  | "payer";

export type ClaimWorkflowStageState = {
  id: ClaimWorkflowStageId;
  status: WorkflowStageStatus;
  summary: string;
};

function payerDisplayName(claim: ClaimDetail | null): string {
  const code = claim?.payer_code?.trim();
  return code || "the insurer";
}

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
  const clearances = claim.advisory_clearances ?? [];
  const findings = (evaluation?.deterministic_findings ?? []).filter(
    (finding) =>
      !isAdvisorFindingCleared({ ...finding, source: "rules" }, clearances),
  );
  const iqCount = asAdvisorFindings(evaluation?.ai_findings).filter(
    (finding) =>
      !isAdvisorFindingCleared(
        { ...finding, source: finding.source ?? "iq" },
        clearances,
      ),
  ).length;
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

  const advisoryStatus = resolveClaimAdvisoryStatus(claim);
  if (advisoryStatus === "pending" || advisoryStatus === "processing") {
    return {
      id: "advisory",
      status: "current",
      summary: "Advisories processing",
    };
  }
  if (advisoryStatus === "failed") {
    return {
      id: "advisory",
      status: "blocked",
      summary: "Needs attention",
    };
  }

  if (!evaluation) {
    return {
      id: "advisory",
      status: "current",
      summary: "Run an evaluation against the payer rules",
    };
  }

  if (evaluation.status === "pending_ai" && !blocked) {
    return {
      id: "advisory",
      status: "current",
      summary: "IQ review in progress",
    };
  }

  if (blocked) {
    return {
      id: "advisory",
      status: "blocked",
      summary: "Needs attention",
    };
  }

  if (hasOverride) {
    return {
      id: "advisory",
      status: "completed",
      summary: "Override recorded — submission is allowed",
    };
  }

  const warningCount = findings.filter(
    (finding) => finding.severity === "warning",
  ).length;
  const iqNotesLabel = `${iqCount} IQ note${iqCount === 1 ? "" : "s"}`;

  if (iqCount > 0 || warningCount > 0) {
    let summary: string;
    if (findings.length === 0) {
      summary = `No rule findings · ${iqNotesLabel}`;
    } else if (warningCount > 0 && iqCount > 0) {
      summary = `${warningCount} warning${warningCount === 1 ? "" : "s"} — submission is allowed · ${iqNotesLabel}`;
    } else if (warningCount > 0) {
      summary = `${warningCount} warning${warningCount === 1 ? "" : "s"} — submission is allowed`;
    } else {
      summary = `${findings.length} finding${findings.length === 1 ? "" : "s"} reviewed · ${iqNotesLabel}`;
    }
    return {
      id: "advisory",
      status: "warning",
      summary,
    };
  }

  if (findings.length === 0) {
    return {
      id: "advisory",
      status: "completed",
      summary: "No advisory findings",
    };
  }

  return {
    id: "advisory",
    status: "completed",
    summary: `${findings.length} finding${findings.length === 1 ? "" : "s"} reviewed`,
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

  if (isClaimAdvisoryProcessing(claim)) {
    return {
      id: "queue",
      status: "pending",
      summary: "Waiting for advisories",
    };
  }

  if (resolveClaimAdvisoryStatus(claim) === "failed") {
    return {
      id: "queue",
      status: "pending",
      summary: "Needs attention",
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

function payerResponseState(claim: ClaimDetail | null): ClaimWorkflowStageState {
  const payerName = payerDisplayName(claim);

  if (!claim) {
    return {
      id: "payer",
      status: "pending",
      summary: "Available after the claim is submitted",
    };
  }

  const claimStatus = String(claim.status).toLowerCase();
  if (claimStatus === "draft" || claimStatus === "") {
    return {
      id: "payer",
      status: "pending",
      summary: `Waiting until the claim is submitted to ${payerName}`,
    };
  }

  const payerStatus = String(claim.payer_status || "awaiting_payer").toLowerCase();

  if (payerStatus === "closed") {
    return {
      id: "payer",
      status: "completed",
      summary: `${payerName} confirmed the claim was closed`,
    };
  }

  if (payerStatus === "settled_via_remittance") {
    return {
      id: "payer",
      status: "completed",
      summary: `Payment confirmed via ${payerName} remittance`,
    };
  }

  if (payerStatus === "manual_submission") {
    return {
      id: "payer",
      status: "completed",
      summary: "Submission was done manually",
    };
  }

  if (payerStatus === "denied_via_remittance") {
    return {
      id: "payer",
      status: "failed",
      summary: `${payerName} remittance denied payment`,
    };
  }

  if (payerStatus === "failed") {
    return {
      id: "payer",
      status: "failed",
      summary: `${payerName} response needs attention`,
    };
  }

  if (payerStatus === "processing") {
    return {
      id: "payer",
      status: "current",
      summary: `${payerName} is processing the claim`,
    };
  }

  if (payerStatus === "not_applicable") {
    return {
      id: "payer",
      status: "pending",
      summary: "Not submitted yet",
    };
  }

  return {
    id: "payer",
    status: "current",
    summary: `Awaiting a response from ${payerName}`,
  };
}

/**
 * Derive claim workflow stage statuses from requirement checks + claim state.
 */
export function getClaimWorkflowStageStates(
  requirementItems: InvoiceClaimReadinessItem[],
  claim: ClaimDetail | null,
  systemReadinessItems?: InvoiceClaimReadinessItem[],
): ClaimWorkflowStageState[] {
  const checklistItems = claim
    ? requirementItems
    : [...(systemReadinessItems ?? []), ...requirementItems];

  return [
    requirementsState(checklistItems, claim),
    advisoryState(claim),
    queueState(claim),
    payerResponseState(claim),
  ];
}

/** Hide Requirements after create unless a blocking check is still open. */
export function shouldShowRequirementsStage(
  stage: ClaimWorkflowStageState,
  claim?: ClaimDetail | null,
): boolean {
  if (!claim) {
    return true;
  }
  return stage.status === "blocked";
}

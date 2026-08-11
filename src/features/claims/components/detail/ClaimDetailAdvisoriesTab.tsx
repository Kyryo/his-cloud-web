"use client";

import { StatusBanner } from "@/components/ui/status-banner";
import { ClaimWorkflowCard } from "@/features/claims/components/ClaimWorkflowCard";
import type { ClaimDetail } from "@/features/claims/types/claims.types";
import { getClaimRequirementCheckItems } from "@/features/invoices/utils/invoice-claim-readiness";

type ClaimDetailAdvisoriesTabProps = {
  claim: ClaimDetail;
  isActive: boolean;
  onClaimUpdated?: (claim: ClaimDetail) => void;
  onRequestSubmit?: () => void;
};

export function ClaimDetailAdvisoriesTab({
  claim,
  isActive,
  onClaimUpdated,
  onRequestSubmit,
}: ClaimDetailAdvisoriesTabProps) {
  if (!isActive) {
    return null;
  }

  const requirementItems = getClaimRequirementCheckItems(null, claim);
  const autoCloseFailed =
    String(claim.payer_status || "").toLowerCase() === "failed";
  const payerName = claim.payer_code?.trim() || "the insurer";

  return (
    <div className="space-y-3" data-testid="claim-detail-advisories-tab">
      {autoCloseFailed ? (
        <StatusBanner
          variant="warning"
          showIcon={false}
          message={`${payerName} auto-close needs attention`}
          description={`Automatic closing with ${payerName} did not complete. Please review the claim in ${payerName} and finish the close manually.`}
          data-testid="claim-auto-close-failed-alert"
        />
      ) : null}
      <ClaimWorkflowCard
        claim={claim}
        readinessItems={requirementItems}
        requirementItems={requirementItems}
        onClaimUpdated={onClaimUpdated}
        onSubmit={onRequestSubmit}
        showSubmitInQueue
      />
    </div>
  );
}

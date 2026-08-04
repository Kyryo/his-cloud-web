"use client";

import { ClaimWorkflowCard } from "@/features/claims/components/ClaimWorkflowCard";
import type { ClaimDetail } from "@/features/claims/types/claims.types";
import { getClaimRequirementCheckItems } from "@/features/invoices/utils/invoice-claim-readiness";

type ClaimDetailAdvisoriesTabProps = {
  claim: ClaimDetail;
  isActive: boolean;
  onClaimUpdated?: (claim: ClaimDetail) => void;
};

export function ClaimDetailAdvisoriesTab({
  claim,
  isActive,
  onClaimUpdated,
}: ClaimDetailAdvisoriesTabProps) {
  if (!isActive) {
    return null;
  }

  const requirementItems = getClaimRequirementCheckItems(null, claim);

  return (
    <div data-testid="claim-detail-advisories-tab">
      <ClaimWorkflowCard
        claim={claim}
        readinessItems={requirementItems}
        requirementItems={requirementItems}
        onClaimUpdated={onClaimUpdated}
      />
    </div>
  );
}

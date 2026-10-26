"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { ClaimDetailActivityTab } from "@/features/claims/components/detail/ClaimDetailActivityTab";
import { ClaimDetailAdvisoriesTab } from "@/features/claims/components/detail/ClaimDetailAdvisoriesTab";
import { ClaimDetailClaimedItemsTab } from "@/features/claims/components/detail/ClaimDetailClaimedItemsTab";
import { useClaimDetail } from "@/features/claims/components/detail/claim-detail-context";
import { ClaimDetailOdontogramTab } from "@/features/claims/components/detail/ClaimDetailOdontogramTab";
import { ClaimDetailReferenceTab } from "@/features/claims/components/detail/ClaimDetailReferenceTab";
import type { ClaimDetailTabId } from "@/features/claims/utils/claim-detail-tabs";
import { shouldShowClaimOdontogramTab } from "@/features/claims/utils/claim-odontogram-tab";
import { ROUTES } from "@/constants/routes";

type ClaimDetailTabPageProps = {
  tab: ClaimDetailTabId;
};

export function ClaimDetailTabPage({ tab }: ClaimDetailTabPageProps) {
  const router = useRouter();
  const { claimId, claim, onClaimUpdated, requestSubmit } = useClaimDetail();
  const showOdontogram = shouldShowClaimOdontogramTab(claim);

  useEffect(() => {
    if (tab === "odontogram" && !showOdontogram) {
      router.replace(ROUTES.claimDetail(claimId));
    }
  }, [claimId, router, showOdontogram, tab]);

  if (tab === "odontogram" && !showOdontogram) {
    return null;
  }

  switch (tab) {
    case "items":
      return <ClaimDetailClaimedItemsTab claim={claim} isActive />;
    case "odontogram":
      return (
        <ClaimDetailOdontogramTab
          claim={claim}
          isActive
          onClaimUpdated={onClaimUpdated}
        />
      );
    case "reference":
      return <ClaimDetailReferenceTab claim={claim} isActive />;
    case "activity":
      return (
        <ClaimDetailActivityTab
          invoiceId={claim.invoice_uuid ?? claim.invoice_id ?? claim.invoice ?? null}
          isActive
        />
      );
    default:
      return (
        <ClaimDetailAdvisoriesTab
          claim={claim}
          isActive
          onClaimUpdated={onClaimUpdated}
          onRequestSubmit={requestSubmit}
        />
      );
  }
}

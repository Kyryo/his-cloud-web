"use client";

import { useSelectedLayoutSegment } from "next/navigation";

import {
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
} from "@/features/app-shell/components/page-layout";
import { ROUTES } from "@/constants/routes";
import type { ClaimDetail } from "@/features/claims/types/claims.types";
import {
  CLAIM_DETAIL_TAB_LABELS,
  claimDetailTabFromSegment,
  visibleClaimDetailTabs,
} from "@/features/claims/utils/claim-detail-tabs";

type ClaimDetailTabNavProps = {
  claimId: string;
  claim: ClaimDetail;
};

export function ClaimDetailTabNav({ claimId, claim }: ClaimDetailTabNavProps) {
  const activeTab = claimDetailTabFromSegment(useSelectedLayoutSegment());
  const claimedItemCount =
    claim.claim_invoices?.reduce(
      (count, invoice) => count + (invoice.line_items?.length ?? 0),
      0,
    ) ?? 0;
  const findingCount = claim.latest_advisor_evaluation?.deterministic_count ?? 0;

  return (
    <DetailPageTabsNavSection aria-label="Claim sections">
      {visibleClaimDetailTabs(claim).map((tab) => {
        const label = CLAIM_DETAIL_TAB_LABELS[tab];
        const text =
          tab === "items" && claimedItemCount > 0
            ? `${label} (${claimedItemCount})`
            : tab === "claim" && findingCount > 0
              ? `${label} (${findingCount})`
              : label;

        return (
          <DetailPageTabNavItem
            key={tab}
            href={ROUTES.claimDetailTab(claimId, tab)}
            isActive={tab === activeTab}
          >
            <span className="relative inline-flex items-center gap-2">
              {text}
              {tab === "claim" && claim.has_blocking_advisories ? (
                <span
                  className="size-2 rounded-full bg-red-500"
                  aria-label="Blocking advisories"
                />
              ) : null}
            </span>
          </DetailPageTabNavItem>
        );
      })}
    </DetailPageTabsNavSection>
  );
}

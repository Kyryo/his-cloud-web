"use client";

import type { ReactNode } from "react";

import { ClaimStatusBadge } from "@/features/claims/components/ClaimStatusBadge";
import type { ClaimDetail } from "@/features/claims/types/claims.types";
import {
  DetailPageDescription,
  DetailPageHeaderSection,
  DetailPageTitle,
} from "@/features/app-shell/components/page-layout";

type ClaimDetailHeaderProps = {
  claim: ClaimDetail;
  actions?: ReactNode;
};

export function ClaimDetailHeader({ claim, actions }: ClaimDetailHeaderProps) {
  const customerName = claim.customer_name?.trim() || "Unknown client";
  const claimLabel =
    claim.claim_reference_number ||
    claim.invoice_name ||
    `Claim #${claim.id}`;

  return (
    <DetailPageHeaderSection>
      <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <DetailPageTitle>{customerName}</DetailPageTitle>
            <ClaimStatusBadge status={claim.status} />
          </div>

          <DetailPageDescription className="font-mono">{claimLabel}</DetailPageDescription>
        </div>
        {actions}
      </div>
    </DetailPageHeaderSection>
  );
}

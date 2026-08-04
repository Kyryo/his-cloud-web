"use client";

import type { ReactNode } from "react";

import { ClaimStatusBadge } from "@/features/claims/components/ClaimStatusBadge";
import type { ClaimDetail } from "@/features/claims/types/claims.types";
import { DetailPageHeaderSection } from "@/features/app-shell/components/page-layout";

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
            <h1 className="truncate text-lg font-semibold text-brand-navy sm:text-xl">
              {customerName}
            </h1>
            <ClaimStatusBadge status={claim.status} />
          </div>

          <p className="mt-1 font-mono text-sm text-brand-muted">{claimLabel}</p>
        </div>
        {actions}
      </div>
    </DetailPageHeaderSection>
  );
}

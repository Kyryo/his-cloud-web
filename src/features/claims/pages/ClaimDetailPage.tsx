"use client";

import { useEffect, useState } from "react";

import {
  PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS,
  PageLoader,
} from "@/components/page-loader";
import { DetailPageLayout } from "@/features/app-shell/components/page-layout";
import { useAppBreadcrumb } from "@/features/app-shell/hooks/use-app-breadcrumb";
import { ClaimDetailActions } from "@/features/claims/components/detail/ClaimDetailActions";
import { ClaimDetailHeader } from "@/features/claims/components/detail/ClaimDetailHeader";
import { ClaimDetailTabs } from "@/features/claims/components/detail/ClaimDetailTabs";
import { fetchClaim } from "@/features/claims/services/claims.service";
import type { ClaimDetail } from "@/features/claims/types/claims.types";

type ClaimDetailPageProps = {
  claimId: string;
};

export function ClaimDetailPage({ claimId }: ClaimDetailPageProps) {
  const [claim, setClaim] = useState<ClaimDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useAppBreadcrumb(
    claim?.customer_name?.trim() ||
      (claim ? claim.claim_reference_number || `Claim #${claim.id}` : null),
  );

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchClaim(claimId);
        if (!cancelled) {
          setClaim(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load claim.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [claimId]);

  if (isLoading) {
    return (
      <PageLoader
        message="Loading claim..."
        className={PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS}
      />
    );
  }

  if (error || !claim) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <h1 className="text-lg font-semibold text-red-800">Claim not found</h1>
        <p className="mt-2 text-sm text-red-700">
          {error ?? "This claim could not be loaded."}
        </p>
      </div>
    );
  }

  return (
    <DetailPageLayout data-testid="claim-detail-page">
      <ClaimDetailHeader
        claim={claim}
        actions={
          <ClaimDetailActions claim={claim} onClaimUpdated={setClaim} />
        }
      />
      <ClaimDetailTabs claim={claim} onClaimUpdated={setClaim} />
    </DetailPageLayout>
  );
}

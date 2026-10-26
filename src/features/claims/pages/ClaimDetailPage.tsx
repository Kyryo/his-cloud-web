"use client";

import { useEffect, useState, type ReactNode } from "react";

import {
  PAGE_CONTENT_LOADER_BELOW_PAGE_CHROME_CLASS,
  PageLoader,
} from "@/components/page-loader";
import { DetailPageLayout, DetailPageNotFound } from "@/features/app-shell/components/page-layout";
import { useAppBreadcrumb } from "@/features/app-shell/hooks/use-app-breadcrumb";
import { SubmitClaimDialog } from "@/features/claims/components/SubmitClaimDialog";
import { ClaimDetailActions } from "@/features/claims/components/detail/ClaimDetailActions";
import { ClaimDetailHeader } from "@/features/claims/components/detail/ClaimDetailHeader";
import { ClaimDetailTabs } from "@/features/claims/components/detail/ClaimDetailTabs";
import { ClaimDetailProvider } from "@/features/claims/components/detail/claim-detail-context";
import { fetchClaim } from "@/features/claims/services/claims.service";
import type { ClaimDetail } from "@/features/claims/types/claims.types";
import { useClaimAdvisoryPoll } from "@/features/claims/hooks/use-claim-advisory-poll";

type ClaimDetailPageProps = {
  claimId: string;
  children: ReactNode;
};

export function ClaimDetailPage({ claimId, children }: ClaimDetailPageProps) {
  const [claim, setClaim] = useState<ClaimDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);

  useAppBreadcrumb(
    claim?.customer_name?.trim() ||
      (claim ? claim.claim_reference_number || `Claim #${claim.id}` : null),
  );

  useClaimAdvisoryPoll(claim, { notifyWhenReady: true, onUpdate: setClaim });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const data = await fetchClaim(claimId);
        if (!cancelled) {
          setClaim(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setClaim(null);
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
      <DetailPageNotFound
        title="Claim not found"
        message={error ?? "This claim could not be loaded."}
      />
    );
  }

  return (
    <ClaimDetailProvider
      value={{
        claimId,
        claim,
        onClaimUpdated: setClaim,
        requestSubmit: () => setSubmitOpen(true),
      }}
    >
      <DetailPageLayout data-testid="claim-detail-page">
        <ClaimDetailHeader
          claim={claim}
          actions={
            <ClaimDetailActions
              claim={claim}
              onClaimUpdated={setClaim}
              onRequestSubmit={() => setSubmitOpen(true)}
            />
          }
        />
        <ClaimDetailTabs claimId={claimId} claim={claim}>
          {children}
        </ClaimDetailTabs>
        <SubmitClaimDialog
          claim={claim}
          open={submitOpen}
          onOpenChange={setSubmitOpen}
          onSuccess={setClaim}
          onClaimUpdated={setClaim}
        />
      </DetailPageLayout>
    </ClaimDetailProvider>
  );
}

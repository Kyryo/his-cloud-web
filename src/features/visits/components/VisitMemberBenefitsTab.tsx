"use client";

import { Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { DetailTabEmptyState } from "@/components/detail/detail-tab-empty-state";
import { SecondaryButton } from "@/components/ui/app-buttons";
import { StatusBanner } from "@/components/ui/status-banner";
import { formatDisplayDateTime } from "@/features/customers/utils/format-customer";
import { MemberBenefitsTable } from "@/features/member-benefits/components/MemberBenefitsTable";
import { refreshVisitMemberBenefits } from "@/features/visits/services/visits.service";
import type {
  VisitDetail,
  VisitMemberBenefitsSnapshot,
} from "@/features/visits/types/visit.types";

type VisitMemberBenefitsTabProps = {
  visit: VisitDetail;
  onRefresh: () => Promise<void>;
  onSnapshotUpdated: (snapshot: VisitMemberBenefitsSnapshot) => void;
};

export function VisitMemberBenefitsTab({
  visit,
  onRefresh,
  onSnapshotUpdated,
}: VisitMemberBenefitsTabProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const snapshot = visit.member_benefits;

  useEffect(() => {
    if (snapshot?.status !== "pending") {
      return;
    }
    const timer = window.setInterval(() => {
      void onRefresh();
    }, 3000);
    return () => window.clearInterval(timer);
  }, [onRefresh, snapshot?.status]);

  if (visit.mode_of_payment !== "insurance") {
    return (
      <DetailTabEmptyState
        icon={ShieldCheck}
        title="Insurance benefits unavailable"
        description="Member benefits are shown for insurance visits only."
      />
    );
  }

  if (!snapshot) {
    return (
      <DetailTabEmptyState
        icon={ShieldCheck}
        title="No benefits on file"
        description="Benefits were not requested for this visit. This can happen when the payer is not MASM or no membership number is on file."
      />
    );
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    setRefreshError(null);
    try {
      const refreshed = await refreshVisitMemberBenefits(visit.uuid);
      onSnapshotUpdated(refreshed);
    } catch (err) {
      setRefreshError(
        err instanceof Error ? err.message : "Could not refresh member benefits.",
      );
    } finally {
      setIsRefreshing(false);
    }
  }

  if (snapshot.status === "pending") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-xl border border-brand-border bg-white px-4 py-8 text-sm text-brand-muted">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Fetching member benefits from MASM...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="visit-member-benefits-tab">
      <section className="rounded-xl border border-brand-border bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-brand-navy">Member benefits</p>
            <p className="mt-1 text-xs text-brand-muted">
              Membership {snapshot.membership_number}
              {snapshot.requested_at
                ? ` · Requested ${formatDisplayDateTime(snapshot.requested_at)}`
                : null}
            </p>
          </div>
          <SecondaryButton
            type="button"
            disabled={isRefreshing}
            onClick={() => void handleRefresh()}
            data-testid="visit-member-benefits-refresh"
          >
            {isRefreshing ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="size-4" aria-hidden="true" />
                Refresh
              </>
            )}
          </SecondaryButton>
        </div>

        {refreshError ? (
          <StatusBanner variant="error" message={refreshError} className="mt-4" />
        ) : null}

        {snapshot.status === "failed" ? (
          <StatusBanner
            variant="error"
            message={
              snapshot.error_message ||
              "Member benefits could not be loaded from MASM."
            }
            className="mt-4"
          />
        ) : null}
      </section>

      {snapshot.status === "succeeded" && snapshot.benefits.length === 0 ? (
        <DetailTabEmptyState
          icon={ShieldCheck}
          title="No benefits returned"
          description="MASM did not return any active benefits for this membership number."
        />
      ) : null}

      {snapshot.status === "succeeded" && snapshot.benefits.length > 0 ? (
        <MemberBenefitsTable benefits={snapshot.benefits} />
      ) : null}
    </div>
  );
}

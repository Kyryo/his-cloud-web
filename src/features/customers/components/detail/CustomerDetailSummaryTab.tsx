"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, Loader2 } from "lucide-react";

import { StatsCard1, StatsCard1Grid } from "@/components/stats-card1";
import {
  CustomerActivityTimeline,
} from "@/features/customers/components/detail/CustomerActivityTimeline";
import { CustomerDetailTabEmptyState } from "@/features/customers/components/detail/CustomerDetailTabEmptyState";
import { CustomerTabSkeleton } from "@/features/customers/components/detail/CustomerTabSkeleton";
import {
  extractCustomerBillingCounts,
  fetchCustomerBillingSummary,
} from "@/features/customers/services/customer-billing.service";
import { fetchCustomerEncounters } from "@/features/customers/services/customer-encounters.service";
import {
  countCustomerVisits,
  fetchCustomerVisits,
} from "@/features/customers/services/customer-visits.service";
import type { CustomerEncounter } from "@/features/customers/types/customer-encounter.types";
import type { Customer } from "@/features/customers/types/customer.types";
import { formatCompactNumber } from "@/utils/format-compact-number";
import { cn } from "@/lib/utils";

const ACTIVITY_PAGE_SIZE = 10;
const SUMMARY_STAT_CARD_CLASS = "border-brand-border bg-white shadow-none";

type CustomerDetailSummaryTabProps = {
  customer: Customer;
  isActive: boolean;
};

type SummaryStats = {
  visits: number;
  salesOrders: number | null;
  invoices: number | null;
  payments: number | null;
  billingUnavailable: boolean;
  isBillingLoading: boolean;
};

function StatCardValue({
  value,
  unavailable,
  isLoading,
}: {
  value: number | null;
  unavailable?: boolean;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <span className="inline-flex items-center gap-1.5 text-brand-muted">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        <span className="sr-only">Loading</span>
      </span>
    );
  }

  if (value === null) {
    return (
      <span className="text-brand-muted" title={unavailable ? "Unavailable" : undefined}>
        —
      </span>
    );
  }

  return <>{formatCompactNumber(value)}</>;
}

export function CustomerDetailSummaryTab({
  customer,
  isActive,
}: CustomerDetailSummaryTabProps) {
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [encounters, setEncounters] = useState<CustomerEncounter[]>([]);
  const [activityPage, setActivityPage] = useState(1);
  const [hasMoreActivity, setHasMoreActivity] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadMoreActivity = useCallback(async () => {
    if (isLoadingMore || !hasMoreActivity) {
      return;
    }

    setIsLoadingMore(true);

    try {
      const nextPage = activityPage + 1;
      const response = await fetchCustomerEncounters({
        customerId: customer.id,
        page: nextPage,
        pageSize: ACTIVITY_PAGE_SIZE,
      });

      setEncounters((current) => [...current, ...response.results]);
      setActivityPage(nextPage);
      setHasMoreActivity(Boolean(response.pagination?.next));
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Failed to load more activity.",
      );
    } finally {
      setIsLoadingMore(false);
    }
  }, [activityPage, customer.id, hasMoreActivity, isLoadingMore]);

  useEffect(() => {
    if (!isActive || hasLoaded) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const [visits, encountersResponse] = await Promise.all([
          fetchCustomerVisits(customer.uuid, { limit: 100 }),
          fetchCustomerEncounters({
            customerId: customer.id,
            page: 1,
            pageSize: ACTIVITY_PAGE_SIZE,
          }),
        ]);

        if (cancelled) {
          return;
        }

        setStats({
          visits: countCustomerVisits(visits),
          salesOrders: null,
          invoices: null,
          payments: null,
          billingUnavailable: false,
          isBillingLoading: true,
        });
        setEncounters(encountersResponse.results);
        setActivityPage(1);
        setHasMoreActivity(Boolean(encountersResponse.pagination?.next));
        setHasLoaded(true);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setLoadError(
          error instanceof Error ? error.message : "Failed to load summary.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [customer.id, customer.uuid, hasLoaded, isActive]);

  useEffect(() => {
    if (!isActive || !hasLoaded || !stats?.isBillingLoading) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const billingResult = await fetchCustomerBillingSummary(customer.uuid).catch(
        () => null,
      );

      if (cancelled) {
        return;
      }

      const billingCounts = billingResult
        ? extractCustomerBillingCounts(billingResult)
        : null;

      setStats((current) =>
        current
          ? {
              ...current,
              salesOrders: billingCounts?.salesOrders ?? null,
              invoices: billingCounts?.invoices ?? null,
              payments: billingCounts?.payments ?? null,
              billingUnavailable: billingResult === null,
              isBillingLoading: false,
            }
          : current,
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [customer.uuid, hasLoaded, isActive, stats?.isBillingLoading]);

  if (!isActive) {
    return null;
  }

  if (isLoading && !hasLoaded) {
    return <CustomerTabSkeleton statCards={4} rows={5} />;
  }

  if (loadError && !hasLoaded) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-700">
        {loadError}
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="customer-detail-summary-tab">
      <StatsCard1Grid>
        <StatsCard1
          className={SUMMARY_STAT_CARD_CLASS}
          title="Visits"
          value={<StatCardValue value={stats?.visits ?? null} />}
        />
        <StatsCard1
          className={SUMMARY_STAT_CARD_CLASS}
          title="Sales orders"
          value={
            <StatCardValue
              value={stats?.salesOrders ?? null}
              unavailable={stats?.billingUnavailable}
              isLoading={stats?.isBillingLoading}
            />
          }
        />
        <StatsCard1
          className={SUMMARY_STAT_CARD_CLASS}
          title="Invoices"
          value={
            <StatCardValue
              value={stats?.invoices ?? null}
              unavailable={stats?.billingUnavailable}
              isLoading={stats?.isBillingLoading}
            />
          }
        />
        <StatsCard1
          className={SUMMARY_STAT_CARD_CLASS}
          title="Payments"
          value={
            <StatCardValue
              value={stats?.payments ?? null}
              unavailable={stats?.billingUnavailable}
              isLoading={stats?.isBillingLoading}
            />
          }
        />
      </StatsCard1Grid>

      {encounters.length === 0 ? (
        <CustomerDetailTabEmptyState
          icon={Activity}
          title="No activity yet"
          description="Events such as profile updates, insurance changes, and notes will appear here as they happen."
          data-testid="customer-activity-empty-state"
        />
      ) : (
        <CustomerActivityTimeline
          encounters={encounters}
          hasMore={hasMoreActivity}
          isLoadingMore={isLoadingMore}
          onLoadMore={() => void loadMoreActivity()}
        />
      )}

      {loadError && hasLoaded ? (
        <p className={cn("text-xs text-red-600")}>{loadError}</p>
      ) : null}
    </div>
  );
}

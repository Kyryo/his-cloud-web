"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import {
  CustomerActivityTimeline,
} from "@/features/customers/components/detail/CustomerActivityTimeline";
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
import {
  formatCompactAmount,
  formatCompactNumber,
} from "@/utils/format-compact-number";
import { formatSalesOrderAmount } from "@/features/sales-orders/utils/format-sales-order";
import type { CustomerBillingTotals } from "@/features/customers/types/customer-billing.types";
import { cn } from "@/lib/utils";

const ACTIVITY_PAGE_SIZE = 20;
const STAT_CURRENCY = "MWK";

type CustomerDetailSummaryTabProps = {
  customer: Customer;
  isActive: boolean;
  billingRefreshKey?: number;
};

type SummaryStats = {
  visits: number;
  salesOrders: number | null;
  invoices: number | null;
  totals: CustomerBillingTotals | null;
  billingUnavailable: boolean;
  isBillingLoading: boolean;
};

function formatBillingTotal(value: number | string | null | undefined) {
  if (value === null || value === undefined) {
    return "—";
  }
  return formatSalesOrderAmount(value, STAT_CURRENCY);
}

function StatCurrencyValue({
  value,
  amountClassName,
}: {
  value: number | string | null | undefined;
  amountClassName?: string;
}) {
  const amount = formatCompactAmount(value);
  if (amount === "—") {
    return <span className={amountClassName}>—</span>;
  }

  return (
    <span
      className="inline-flex items-baseline gap-1.5"
      title={formatBillingTotal(value)}
    >
      <span className={amountClassName}>{amount}</span>
      <span className="text-[0.45em] font-medium uppercase tracking-[0.08em] text-brand-muted">
        {STAT_CURRENCY}
      </span>
    </span>
  );
}

function parseBillingAmount(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

export function CustomerDetailSummaryTab({
  customer,
  isActive,
  billingRefreshKey = 0,
}: CustomerDetailSummaryTabProps) {
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [encounters, setEncounters] = useState<CustomerEncounter[]>([]);
  const [activityPage, setActivityPage] = useState(1);
  const [activityTotalCount, setActivityTotalCount] = useState(0);
  const [hasNextActivity, setHasNextActivity] = useState(false);
  const [hasPreviousActivity, setHasPreviousActivity] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isActivityRefreshing, setIsActivityRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadActivityPage = useCallback(
    async (page: number, options?: { quiet?: boolean }) => {
      if (!options?.quiet) {
        setIsActivityRefreshing(true);
      }

      try {
        const response = await fetchCustomerEncounters({
          customerId: customer.id,
          page,
          pageSize: ACTIVITY_PAGE_SIZE,
        });

        setEncounters(response.results);
        setActivityPage(page);
        setActivityTotalCount(
          response.pagination?.count ?? response.results.length,
        );
        setHasNextActivity(Boolean(response.pagination?.next));
        setHasPreviousActivity(Boolean(response.pagination?.previous));
        setLoadError(null);
      } catch (error) {
        setLoadError(
          error instanceof Error
            ? error.message
            : "Failed to load activity.",
        );
      } finally {
        setIsActivityRefreshing(false);
      }
    },
    [customer.id],
  );

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
          totals: null,
          billingUnavailable: false,
          isBillingLoading: true,
        });
        setEncounters(encountersResponse.results);
        setActivityPage(1);
        setActivityTotalCount(
          encountersResponse.pagination?.count ??
            encountersResponse.results.length,
        );
        setHasNextActivity(Boolean(encountersResponse.pagination?.next));
        setHasPreviousActivity(
          Boolean(encountersResponse.pagination?.previous),
        );
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
              totals: billingResult?.totals ?? null,
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

  useEffect(() => {
    if (!isActive || !hasLoaded || billingRefreshKey === 0) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const billingResult = await fetchCustomerBillingSummary(customer.uuid).catch(
        () => null,
      );

      if (cancelled || !billingResult) {
        return;
      }

      const billingCounts = extractCustomerBillingCounts(billingResult);
      setStats((current) =>
        current
          ? {
              ...current,
              salesOrders: billingCounts.salesOrders,
              invoices: billingCounts.invoices,
              totals: billingResult.totals,
              billingUnavailable: false,
              isBillingLoading: false,
            }
          : current,
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [billingRefreshKey, customer.uuid, hasLoaded, isActive]);

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

  const dueAmount = parseBillingAmount(stats?.totals?.total_due);
  const hasDue = dueAmount > 0;
  const isBillingLoading = Boolean(stats?.isBillingLoading);

  return (
    <div className="space-y-5" data-testid="customer-detail-summary-tab">
      {/* Seamless Cardless Stat Strip */}
      <dl
        className="grid grid-cols-2 divide-y divide-dash-border/60 border-b border-dash-border/80 py-2 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x"
        data-testid="customer-detail-stats"
      >
        {/* 1. Visits */}
        <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
          <div className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full bg-blue-500" />
            <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
              Visits
            </dt>
          </div>
          <dd className="mt-1 text-lg font-semibold tracking-tight text-brand-navy tabular-nums">
            {stats?.visits != null ? (
              <span title={String(stats.visits)}>
                {formatCompactNumber(stats.visits)}
              </span>
            ) : (
              "—"
            )}
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">Recorded encounters</p>
        </div>

        {/* 2. Sales orders */}
        <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
          <div className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full bg-indigo-500" />
            <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
              Sales orders
            </dt>
          </div>
          <dd className="mt-1 text-lg font-semibold tracking-tight text-brand-navy tabular-nums">
            {isBillingLoading ? (
              <span className="inline-flex items-center gap-1.5 text-brand-muted">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                <span className="sr-only">Loading</span>
              </span>
            ) : (
              <StatCurrencyValue value={stats?.totals?.total_sales} />
            )}
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">Total order volume</p>
        </div>

        {/* 3. Invoices */}
        <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
          <div className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full bg-emerald-500" />
            <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
              Invoiced
            </dt>
          </div>
          <dd className="mt-1 text-lg font-semibold tracking-tight text-brand-navy tabular-nums">
            {isBillingLoading ? (
              <span className="inline-flex items-center gap-1.5 text-brand-muted">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                <span className="sr-only">Loading</span>
              </span>
            ) : (
              <StatCurrencyValue value={stats?.totals?.total_invoiced} />
            )}
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">Total billed services</p>
        </div>

        {/* 4. Outstanding balance */}
        <div className="p-3.5 transition-colors hover:bg-dash-canvas/40 sm:p-4">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "size-2 shrink-0 rounded-full",
                hasDue ? "bg-red-500" : "bg-emerald-500",
              )}
            />
            <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
              Outstanding balance
            </dt>
          </div>
          <dd
            className={cn(
              "mt-1 text-lg font-semibold tracking-tight tabular-nums",
              hasDue ? "text-red-600" : "text-brand-navy",
            )}
          >
            {isBillingLoading ? (
              <span className="inline-flex items-center gap-1.5 text-brand-muted">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                <span className="sr-only">Loading</span>
              </span>
            ) : (
              <StatCurrencyValue
                value={stats?.totals?.total_due}
                amountClassName={hasDue ? "text-red-600" : undefined}
              />
            )}
          </dd>
          <p className="mt-0.5 text-xs text-brand-muted">
            {hasDue ? (
              <span className="font-medium text-red-700">Payment required</span>
            ) : (
              <span className="font-medium text-emerald-700">Account settled</span>
            )}
          </p>
        </div>
      </dl>

      <CustomerActivityTimeline
        encounters={encounters}
        pagination={{
          page: activityPage,
          pageSize: ACTIVITY_PAGE_SIZE,
          totalCount: activityTotalCount,
          hasPrevious: hasPreviousActivity,
          hasNext: hasNextActivity,
          onPageChange: (page) => {
            void loadActivityPage(page);
          },
          isLoading: isActivityRefreshing,
        }}
      />

      {loadError && hasLoaded ? (
        <p className="text-xs text-red-600">{loadError}</p>
      ) : null}
    </div>
  );
}

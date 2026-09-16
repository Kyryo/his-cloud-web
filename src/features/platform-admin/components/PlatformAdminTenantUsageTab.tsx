"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchPlatformAdminTenantUsage } from "@/features/platform-admin/services/platform-admin.service";
import type {
  PlatformAdminUsageCohortMilestone,
  PlatformAdminUsageFilters,
  PlatformAdminUsageInactiveAlerts,
  PlatformAdminUsageResponse,
} from "@/features/platform-admin/types/platform-admin.types";
import { cn } from "@/lib/utils";

function defaultUsageFilters(): PlatformAdminUsageFilters {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  return {
    dateFrom: firstOfMonth.toISOString().slice(0, 10),
    dateTo: today.toISOString().slice(0, 10),
    period: "week",
  };
}

export function PlatformAdminTenantUsageTab({ tenantUuid }: { tenantUuid: string }) {
  const [usage, setUsage] = useState<PlatformAdminUsageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    void (async () => {
      try {
        const data = await fetchPlatformAdminTenantUsage(
          tenantUuid,
          {
            ...defaultUsageFilters(),
            sections: ["overview"],
          },
        );
        if (!cancelled) {
          setUsage(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load usage analytics.");
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
  }, [tenantUuid]);

  return (
    <div className="space-y-6">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {usage?.inactive_alerts ? (
        <InactiveAlertBanner alerts={usage.inactive_alerts} isLoading={isLoading} />
      ) : null}

      <Card className="rounded-lg border-brand-border shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Active users</CardTitle>
          <p className="text-sm text-brand-muted">
            Distinct users with sign-ins or product activity in rolling windows.
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <SummaryMetricCard
            label="DAU"
            value={usage?.engagement.dau ?? 0}
            isLoading={isLoading}
          />
          <SummaryMetricCard
            label="WAU"
            value={usage?.engagement.wau ?? 0}
            isLoading={isLoading}
          />
          <SummaryMetricCard
            label="MAU"
            value={usage?.engagement.mau ?? 0}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-lg border-brand-border shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Time to first value</CardTitle>
            <p className="text-sm text-brand-muted">
              Days from onboarding to the 20th visit and 20th invoice.
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <FirstValueMetric
              label="20 visits"
              days={usage?.time_to_first_value.days_to_visits_target ?? null}
              reachedAt={usage?.time_to_first_value.visits_reached_at ?? null}
              isLoading={isLoading}
            />
            <FirstValueMetric
              label="20 invoices"
              days={usage?.time_to_first_value.days_to_invoices_target ?? null}
              reachedAt={usage?.time_to_first_value.invoices_reached_at ?? null}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        <Card className="rounded-lg border-brand-border shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Cohort retention</CardTitle>
            <p className="text-sm text-brand-muted">
              Billing activity within 30, 60, and 90 days of onboarding.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <Skeleton className="h-24 w-full rounded-lg" />
            ) : (
              usage?.cohort_retention.milestones.map((milestone) => (
                <CohortMilestoneRow key={milestone.day} milestone={milestone} />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryMetricCard({
  label,
  value,
  isLoading,
}: {
  label: string;
  value: number;
  isLoading: boolean;
}) {
  return (
    <div className="rounded-lg border border-brand-border bg-white p-4">
      <p className="text-xs font-medium uppercase text-brand-muted">{label}</p>
      {isLoading ? (
        <Skeleton className="mt-2 h-8 w-16" />
      ) : (
        <p className="mt-1 text-2xl font-semibold text-brand-navy">{value}</p>
      )}
    </div>
  );
}

function InactiveAlertBanner({
  alerts,
  isLoading,
}: {
  alerts: PlatformAdminUsageInactiveAlerts;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <Skeleton className="h-14 w-full rounded-lg" />;
  }

  const tone =
    alerts.status === "inactive"
      ? "border-red-200 bg-red-50 text-red-800"
      : alerts.status === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-brand-border bg-white text-brand-navy";

  return (
    <div className={cn("rounded-lg border px-4 py-3 text-sm", tone)}>
      <p className="font-medium">
        {alerts.status === "active" ? "Tenant activity" : "Inactive tenant alert"}
      </p>
      <p className="mt-1">{alerts.message}</p>
    </div>
  );
}

function FirstValueMetric({
  label,
  days,
  reachedAt,
  isLoading,
}: {
  label: string;
  days: number | null;
  reachedAt: string | null;
  isLoading: boolean;
}) {
  return (
    <div className="rounded-lg border border-brand-border bg-white p-4">
      <p className="text-xs font-medium uppercase text-brand-muted">{label}</p>
      {isLoading ? (
        <Skeleton className="mt-2 h-8 w-20" />
      ) : days === null ? (
        <p className="mt-1 text-sm text-brand-muted">Target not reached yet</p>
      ) : (
        <>
          <p className="mt-1 text-2xl font-semibold text-brand-navy">{days} days</p>
          {reachedAt ? (
            <p className="mt-1 text-xs text-brand-muted">Reached {reachedAt}</p>
          ) : null}
        </>
      )}
    </div>
  );
}

function CohortMilestoneRow({
  milestone,
}: {
  milestone: PlatformAdminUsageCohortMilestone;
}) {
  const statusLabel = !milestone.evaluable
    ? "Pending"
    : milestone.active
      ? "Active"
      : "Inactive";

  return (
    <div className="flex items-center justify-between rounded-lg border border-brand-border px-4 py-3 text-sm">
      <div>
        <p className="font-medium text-brand-navy">Day {milestone.day}</p>
        <p className="text-xs text-brand-muted">
          {milestone.sales_orders} sales orders · {milestone.invoices} invoices
        </p>
      </div>
      <span
        className={cn(
          "rounded-full px-2.5 py-1 text-xs font-medium",
          !milestone.evaluable && "bg-brand-border/60 text-brand-muted",
          milestone.evaluable &&
            milestone.active &&
            "bg-brand-tint text-brand-primary",
          milestone.evaluable &&
            !milestone.active &&
            "bg-red-50 text-red-700",
        )}
      >
        {statusLabel}
      </span>
    </div>
  );
}

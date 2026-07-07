"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PLATFORM_ADMIN_USAGE_METRICS,
  platformAdminUsageTrendChartConfig,
} from "@/features/platform-admin/constants/usage-chart-config";
import { fetchPlatformAdminTenantUsage } from "@/features/platform-admin/services/platform-admin.service";
import type {
  PlatformAdminUsageCohortMilestone,
  PlatformAdminUsageFilters,
  PlatformAdminUsageInactiveAlerts,
  PlatformAdminUsagePeriod,
  PlatformAdminUsageResponse,
} from "@/features/platform-admin/types/platform-admin.types";
import { cn } from "@/lib/utils";

const UsageTrendChart = dynamic(
  () =>
    import("@/features/platform-admin/components/PlatformAdminUsageCharts").then(
      (mod) => mod.PlatformAdminUsageTrendChart,
    ),
  { ssr: false, loading: () => <Skeleton className="h-[320px] w-full rounded-lg" /> },
);

const UsageMetricChart = dynamic(
  () =>
    import("@/features/platform-admin/components/PlatformAdminUsageCharts").then(
      (mod) => mod.PlatformAdminUsageMetricChart,
    ),
  { ssr: false, loading: () => <Skeleton className="h-[220px] w-full rounded-lg" /> },
);

const UsageHourChart = dynamic(
  () =>
    import("@/features/platform-admin/components/PlatformAdminUsageCharts").then(
      (mod) => mod.PlatformAdminUsageHourChart,
    ),
  { ssr: false, loading: () => <Skeleton className="h-[260px] w-full rounded-lg" /> },
);

function defaultUsageFilters(): PlatformAdminUsageFilters {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  return {
    dateFrom: firstOfMonth.toISOString().slice(0, 10),
    dateTo: today.toISOString().slice(0, 10),
    period: "day",
  };
}

const SUMMARY_CARDS = [
  { key: "sign_ins", label: "Sign-ins" },
  { key: "unique_sign_in_users", label: "Unique sign-in users" },
  { key: "visits", label: "Visits" },
  { key: "appointments", label: "Appointments" },
  { key: "sales_orders", label: "Sales orders" },
  { key: "invoices", label: "Invoices" },
  { key: "payments", label: "Payments" },
  { key: "claims", label: "Claims" },
] as const;

const FEATURE_ADOPTION_CARDS = [
  { key: "customers_registered", label: "Customers" },
  { key: "products_catalogued", label: "Products" },
  { key: "appointments_scheduled", label: "Appointments" },
  { key: "inventory_movements", label: "Inventory moves" },
  { key: "clinical_notes", label: "Clinical notes" },
  { key: "therapy_sessions", label: "Therapy sessions" },
  { key: "claims_submitted", label: "Claims submitted" },
  { key: "reports_exported", label: "Reports exported" },
] as const;

export function PlatformAdminTenantUsageTab({ tenantUuid }: { tenantUuid: string }) {
  const [filters, setFilters] = useState<PlatformAdminUsageFilters>(defaultUsageFilters);
  const [usage, setUsage] = useState<PlatformAdminUsageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    void (async () => {
      try {
        const data = await fetchPlatformAdminTenantUsage(tenantUuid, filters);
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
  }, [tenantUuid, filters]);

  const activeUsers = usage?.summary.active_users ?? 0;
  const usersLoggedIn = usage?.summary.users_logged_in ?? 0;

  const metricCharts = useMemo(
    () =>
      PLATFORM_ADMIN_USAGE_METRICS.map((metric) => ({
        ...metric,
        color:
          platformAdminUsageTrendChartConfig[
            metric.key as keyof typeof platformAdminUsageTrendChartConfig
          ].color,
        data: usage?.series[metric.key] ?? [],
      })),
    [usage],
  );

  return (
    <div className="space-y-6">
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

      <Card className="rounded-lg border-brand-border shadow-none">
        <CardHeader>
          <CardTitle className="text-base">Feature adoption depth</CardTitle>
          <p className="text-sm text-brand-muted">
            Module usage counts in the selected date range.
          </p>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURE_ADOPTION_CARDS.map((card) => (
            <SummaryMetricCard
              key={card.key}
              label={card.label}
              value={usage?.feature_adoption[card.key] ?? 0}
              isLoading={isLoading}
            />
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-lg border-brand-border shadow-none">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle className="text-base">Product usage</CardTitle>
              <p className="mt-1 text-sm text-brand-muted">
                Track adoption across sign-ins, clinical workflows, billing, and claims.
              </p>
            </div>
            <UsageFilters filters={filters} onChange={setFilters} />
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SUMMARY_CARDS.map((card) => (
            <SummaryMetricCard
              key={card.key}
              label={card.label}
              value={usage?.summary[card.key] ?? 0}
              isLoading={isLoading}
            />
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-lg border-brand-border shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Activity trend</CardTitle>
            <p className="text-sm text-brand-muted">
              {activeUsers} active users · {usersLoggedIn} logged in during this range
            </p>
          </CardHeader>
          <CardContent>
            {error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : isLoading ? (
              <Skeleton className="h-[320px] w-full rounded-lg" />
            ) : usage ? (
              <UsageTrendChart series={usage.series} />
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-lg border-brand-border shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Activity by hour</CardTitle>
            <p className="text-sm text-brand-muted">
              Combined sign-ins, visits, appointments, and sales orders by hour of day.
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[260px] w-full rounded-lg" />
            ) : usage ? (
              <UsageHourChart data={usage.activity_by_hour} />
            ) : null}
          </CardContent>
        </Card>

        {metricCharts.map((metric) => (
          <Card key={metric.key} className="rounded-lg border-brand-border shadow-none">
            <CardHeader>
              <CardTitle className="text-base">{metric.label}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-[220px] w-full rounded-lg" />
              ) : (
                <UsageMetricChart
                  title={metric.label}
                  data={metric.data}
                  color={metric.color}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function UsageFilters({
  filters,
  onChange,
}: {
  filters: PlatformAdminUsageFilters;
  onChange: (filters: PlatformAdminUsageFilters) => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="usage-date-from">From</Label>
        <Input
          id="usage-date-from"
          type="date"
          value={filters.dateFrom}
          onChange={(event) =>
            onChange({ ...filters, dateFrom: event.target.value })
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="usage-date-to">To</Label>
        <Input
          id="usage-date-to"
          type="date"
          value={filters.dateTo}
          onChange={(event) => onChange({ ...filters, dateTo: event.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="usage-period">Period</Label>
        <Select
          value={filters.period ?? "day"}
          onValueChange={(value) =>
            onChange({ ...filters, period: value as PlatformAdminUsagePeriod })
          }
        >
          <SelectTrigger id="usage-period" className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="month">Month</SelectItem>
          </SelectContent>
        </Select>
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

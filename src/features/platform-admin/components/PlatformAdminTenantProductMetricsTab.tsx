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
  PlatformAdminUsageFilters,
  PlatformAdminUsagePeriod,
  PlatformAdminUsageResponse,
} from "@/features/platform-admin/types/platform-admin.types";

const UsageMetricChart = dynamic(
  () =>
    import("@/features/platform-admin/components/PlatformAdminUsageCharts").then(
      (mod) => mod.PlatformAdminUsageMetricChart,
    ),
  { ssr: false, loading: () => <Skeleton className="h-[220px] w-full rounded-lg" /> },
);

function defaultUsageFilters(): PlatformAdminUsageFilters {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  return {
    dateFrom: firstOfMonth.toISOString().slice(0, 10),
    dateTo: today.toISOString().slice(0, 10),
    period: "week",
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

export function PlatformAdminTenantProductMetricsTab({
  tenantUuid,
}: {
  tenantUuid: string;
}) {
  const [filters, setFilters] = useState<PlatformAdminUsageFilters>(() => ({
    ...defaultUsageFilters(),
    sections: ["product"],
  }));
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
          setError(
            err instanceof Error ? err.message : "Unable to load product metrics.",
          );
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
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Card className="rounded-lg border-brand-border shadow-none">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle className="text-base">Date range</CardTitle>
              <p className="mt-1 text-sm text-brand-muted">
                Filters apply to feature adoption and product usage below.
              </p>
            </div>
            <UsageFilters filters={filters} onChange={setFilters} />
          </div>
        </CardHeader>
      </Card>

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
        <CardHeader>
          <CardTitle className="text-base">Product usage</CardTitle>
          <p className="mt-1 text-sm text-brand-muted">
            Track adoption across sign-ins, clinical workflows, billing, and claims.
          </p>
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
        <Label htmlFor="product-metrics-date-from">From</Label>
        <Input
          id="product-metrics-date-from"
          type="date"
          value={filters.dateFrom}
          onChange={(event) =>
            onChange({ ...filters, dateFrom: event.target.value })
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="product-metrics-date-to">To</Label>
        <Input
          id="product-metrics-date-to"
          type="date"
          value={filters.dateTo}
          onChange={(event) => onChange({ ...filters, dateTo: event.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="product-metrics-period">Period</Label>
        <Select
          value={filters.period ?? "day"}
          onValueChange={(value) =>
            onChange({ ...filters, period: value as PlatformAdminUsagePeriod })
          }
        >
          <SelectTrigger id="product-metrics-period" className="w-32">
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

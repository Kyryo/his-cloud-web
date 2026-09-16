"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

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
import { fetchPlatformAdminTenantUsage } from "@/features/platform-admin/services/platform-admin.service";
import type {
  PlatformAdminUsageFilters,
  PlatformAdminUsagePeriod,
  PlatformAdminUsageResponse,
} from "@/features/platform-admin/types/platform-admin.types";

const UsageTrendChart = dynamic(
  () =>
    import("@/features/platform-admin/components/PlatformAdminUsageCharts").then(
      (mod) => mod.PlatformAdminUsageTrendChart,
    ),
  { ssr: false, loading: () => <Skeleton className="h-[320px] w-full rounded-lg" /> },
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
    period: "week",
  };
}

export function PlatformAdminTenantActivityTab({
  tenantUuid,
}: {
  tenantUuid: string;
}) {
  const [filters, setFilters] = useState<PlatformAdminUsageFilters>(() => ({
    ...defaultUsageFilters(),
    sections: ["activity"],
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
            err instanceof Error ? err.message : "Unable to load activity analytics.",
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

  const activeUsers = usage?.summary.active_users ?? 0;
  const usersLoggedIn = usage?.summary.users_logged_in ?? 0;

  return (
    <div className="space-y-6">
      <Card className="rounded-lg border-brand-border shadow-none">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle className="text-base">Date range</CardTitle>
              <p className="mt-1 text-sm text-brand-muted">
                Filters apply to the activity charts below.
              </p>
            </div>
            <UsageFilters filters={filters} onChange={setFilters} />
          </div>
        </CardHeader>
      </Card>

      <Card className="rounded-lg border-brand-border shadow-none">
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

      <Card className="rounded-lg border-brand-border shadow-none">
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
        <Label htmlFor="activity-date-from">From</Label>
        <Input
          id="activity-date-from"
          type="date"
          value={filters.dateFrom}
          onChange={(event) =>
            onChange({ ...filters, dateFrom: event.target.value })
          }
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="activity-date-to">To</Label>
        <Input
          id="activity-date-to"
          type="date"
          value={filters.dateTo}
          onChange={(event) => onChange({ ...filters, dateTo: event.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="activity-period">Period</Label>
        <Select
          value={filters.period ?? "day"}
          onValueChange={(value) =>
            onChange({ ...filters, period: value as PlatformAdminUsagePeriod })
          }
        >
          <SelectTrigger id="activity-period" className="w-32">
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

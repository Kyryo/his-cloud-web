"use client";

import {
  Building2,
  DollarSign,
  Flame,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { PageLoader } from "@/components/page-loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ListPageHeaderSection,
  ListPageHeaderTitleBlock,
  ListPageHeaderTopRow,
  ListPageLayout,
  ListPageStatsSection,
} from "@/features/app-shell/components/page-layout";
import { PlatformAdminFinanceEntryPanel } from "@/features/platform-admin/components/PlatformAdminFinanceEntryPanel";
import {
  PlatformAdminCohortRetentionChart,
  PlatformAdminNdrChart,
} from "@/features/platform-admin/components/PlatformAdminOverviewCharts";
import {
  fetchPlatformAdminOverview,
  fetchPlatformAdminTenants,
} from "@/features/platform-admin/services/platform-admin.service";
import type {
  PlatformAdminOverview,
  PlatformAdminOverviewBurnRate,
  PlatformAdminOverviewRevenue,
  PlatformAdminTenant,
} from "@/features/platform-admin/types/platform-admin.types";

function formatMoney(
  metric: PlatformAdminOverviewRevenue | PlatformAdminOverviewBurnRate,
): string {
  const amount = Number(metric.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return "—";
  }
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: metric.currency_code,
    maximumFractionDigits: 0,
  }).format(amount);
}

function hasFinanceData(overview: PlatformAdminOverview): boolean {
  const revenue = Number(overview.summary.revenue.amount);
  const burn = Number(overview.summary.burn_rate.amount);
  return revenue > 0 || burn > 0 || overview.summary.runway_months !== null;
}

export function PlatformAdminOverviewPage() {
  const [overview, setOverview] = useState<PlatformAdminOverview | null>(null);
  const [tenants, setTenants] = useState<PlatformAdminTenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [overviewData, tenantData] = await Promise.all([
        fetchPlatformAdminOverview(),
        fetchPlatformAdminTenants({ pageSize: 200 }),
      ]);
      setOverview(overviewData);
      setTenants(tenantData.results);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load overview.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  if (isLoading || !overview) {
    return <PageLoader message="Loading overview..." />;
  }

  const revenueDisplay = formatMoney(overview.summary.revenue);
  const burnDisplay = formatMoney(overview.summary.burn_rate);
  const runwayDisplay =
    overview.summary.runway_months !== null
      ? `${overview.summary.runway_months} mo`
      : "—";

  return (
    <ListPageLayout>
      <ListPageHeaderSection>
        <ListPageHeaderTopRow>
          <ListPageHeaderTitleBlock
            title="Overview"
            description="Platform health, SaaS economics, and tenant retention."
          />
        </ListPageHeaderTopRow>
      </ListPageHeaderSection>

      <ListPageStatsSection>
        <div className="grid gap-3 md:grid-cols-4">
          <MetricCard
            icon={Building2}
            label="Tenants"
            value={String(overview.summary.active_tenants)}
            detail="Active"
          />
          <MetricCard
            icon={DollarSign}
            label="Revenue"
            value={revenueDisplay}
            detail={overview.summary.revenue.period_label}
            emptyHint={
              revenueDisplay === "—"
                ? "Record payments to populate."
                : undefined
            }
          />
          <MetricCard
            icon={Flame}
            label="Burn rate"
            value={burnDisplay}
            detail={`Trailing ${overview.summary.burn_rate.window_months} months`}
            emptyHint={
              burnDisplay === "—" ? "Record costs to populate." : undefined
            }
          />
          <MetricCard
            icon={TrendingUp}
            label="Runway"
            value={runwayDisplay}
            detail="Months at current burn"
            emptyHint={
              runwayDisplay === "—"
                ? "Record cash balance and costs."
                : undefined
            }
          />
        </div>
      </ListPageStatsSection>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Cohort retention</CardTitle>
            <p className="text-sm text-brand-muted">
              Active tenants by onboarding month (sales order or invoice).
            </p>
          </CardHeader>
          <CardContent>
            <PlatformAdminCohortRetentionChart
              retention={overview.cohort_retention}
            />
          </CardContent>
        </Card>

        <Card className="rounded-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Net dollar retention</CardTitle>
            <p className="text-sm text-brand-muted">
              Revenue from existing tenants vs. the same cohort 12 months prior.
            </p>
          </CardHeader>
          <CardContent>
            <PlatformAdminNdrChart ndr={overview.net_dollar_retention} />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-brand-navy">
            Finance records
          </h2>
          <p className="text-sm text-brand-muted">
            {hasFinanceData(overview)
              ? "Add payments, operating costs, and cash balances to keep metrics current."
              : "Record payments and costs to populate revenue, burn rate, and runway."}
          </p>
        </div>
        <PlatformAdminFinanceEntryPanel
          tenants={tenants}
          onRecorded={() => void loadData()}
        />
      </section>
    </ListPageLayout>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
  emptyHint,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
  detail?: string;
  emptyHint?: string;
}) {
  return (
    <Card className="rounded-lg">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex size-10 items-center justify-center rounded-md bg-brand-tint text-brand-primary">
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase text-brand-muted">
            {label}
          </p>
          <p className="text-2xl font-semibold text-brand-navy">{value}</p>
          {detail ? (
            <p className="text-xs text-brand-muted">{detail}</p>
          ) : null}
          {emptyHint ? (
            <p className="text-xs text-brand-muted">{emptyHint}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

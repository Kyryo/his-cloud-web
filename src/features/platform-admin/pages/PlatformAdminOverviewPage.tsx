"use client";

import { Building2, DollarSign, Flame, TrendingUp } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

import { PageLoader } from "@/components/page-loader";
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
import { usePlatformAdminOverviewQuery } from "@/features/platform-admin/hooks/use-platform-admin-overview-query";
import { PlatformAdminOverviewSection } from "@/features/platform-admin/components/PlatformAdminOverviewSection";
import { PlatformAdminStatRow } from "@/features/platform-admin/components/PlatformAdminStatRow";
import {
  formatOverviewMoney as formatMoney,
  hasOverviewFinanceData as hasFinanceData,
} from "@/features/platform-admin/utils/overview-format";

export function PlatformAdminOverviewPage() {
  const { data, error, isPending, refetch } = usePlatformAdminOverviewQuery();

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to load overview.");
    }
  }, [error]);

  const overview = data?.overview;
  const tenants = data?.tenants ?? [];

  if (isPending || !overview) {
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
        <PlatformAdminStatRow
          stats={[
            {
              icon: Building2,
              label: "Active tenants",
              value: String(overview.summary.active_tenants),
            },
            {
              icon: DollarSign,
              label: "Revenue",
              value: revenueDisplay,
              detail: overview.summary.revenue.period_label,
              emptyHint:
                revenueDisplay === "—"
                  ? "Record payments to populate."
                  : undefined,
            },
            {
              icon: Flame,
              label: "Burn rate",
              value: burnDisplay,
              detail: `Trailing ${overview.summary.burn_rate.window_months} months`,
              emptyHint:
                burnDisplay === "—" ? "Record costs to populate." : undefined,
            },
            {
              icon: TrendingUp,
              label: "Runway",
              value: runwayDisplay,
              detail: "Months at current burn",
              emptyHint:
                runwayDisplay === "—"
                  ? "Record cash balance and costs."
                  : undefined,
            },
          ]}
        />
      </ListPageStatsSection>

      <div className="grid gap-x-10 gap-y-12 xl:grid-cols-5">
        <PlatformAdminOverviewSection
          className="xl:col-span-3"
          title="Cohort retention"
          description="Share of each onboarding cohort still active (sales order or invoice), by months since onboarding."
        >
          <PlatformAdminCohortRetentionChart
            retention={overview.cohort_retention}
          />
        </PlatformAdminOverviewSection>

        <PlatformAdminOverviewSection
          className="xl:col-span-2"
          title="Net dollar retention"
          description="Revenue from existing tenants vs. the same cohort 12 months prior."
          aside={
            overview.net_dollar_retention.current_month_ndr_percent !== null ? (
              <span className="text-2xl font-semibold tabular-nums text-foreground">
                {overview.net_dollar_retention.current_month_ndr_percent}%
              </span>
            ) : null
          }
        >
          <PlatformAdminNdrChart ndr={overview.net_dollar_retention} />
        </PlatformAdminOverviewSection>
      </div>

      <PlatformAdminOverviewSection
        title="Finance records"
        description={
          hasFinanceData(overview)
            ? "Add payments, operating costs, and cash balances to keep metrics current."
            : "Record payments and costs to populate revenue, burn rate, and runway."
        }
      >
        <PlatformAdminFinanceEntryPanel
          tenants={tenants}
          onRecorded={() => void refetch()}
        />
      </PlatformAdminOverviewSection>
    </ListPageLayout>
  );
}

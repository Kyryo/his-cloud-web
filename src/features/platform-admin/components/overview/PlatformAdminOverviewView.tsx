"use client";

import { motion, useReducedMotion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { useMemo, type ReactNode } from "react";

import { OverviewCohortRetention } from "@/features/platform-admin/components/overview/OverviewCohortRetention";
import { OverviewFootprint } from "@/features/platform-admin/components/overview/OverviewFootprint";
import { OverviewNdrChart } from "@/features/platform-admin/components/overview/OverviewNdrChart";
import { OverviewRecentTenants } from "@/features/platform-admin/components/overview/OverviewRecentTenants";
import { OverviewSection } from "@/features/platform-admin/components/overview/OverviewSection";
import { OverviewStatStrip } from "@/features/platform-admin/components/overview/OverviewStatStrip";
import { OverviewTenantGrowthChart } from "@/features/platform-admin/components/overview/OverviewTenantGrowthChart";
import { PlatformAdminFinanceEntryPanel } from "@/features/platform-admin/components/PlatformAdminFinanceEntryPanel";
import type {
  PlatformAdminDashboard,
  PlatformAdminOverview,
  PlatformAdminTenant,
} from "@/features/platform-admin/types/platform-admin.types";
import { hasOverviewFinanceData } from "@/features/platform-admin/utils/overview-format";
import {
  buildTenantGrowthSeries,
  getRecentTenants,
} from "@/features/platform-admin/utils/overview-series";
import { buildOverviewStats } from "@/features/platform-admin/utils/overview-stats";

function Reveal({ index, children }: { index: number; children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay: 0.08 + index * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export type PlatformAdminOverviewViewProps = {
  overview: PlatformAdminOverview;
  tenants: PlatformAdminTenant[];
  tenantsArePartial?: boolean;
  dashboard?: PlatformAdminDashboard | null;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onFinanceRecorded: () => void;
};

/** Presentational platform admin overview; all data is passed in. */
export function PlatformAdminOverviewView({
  overview,
  tenants,
  tenantsArePartial,
  dashboard,
  isRefreshing,
  onRefresh,
  onFinanceRecorded,
}: PlatformAdminOverviewViewProps) {
  const growth = useMemo(() => buildTenantGrowthSeries(tenants), [tenants]);
  const stats = useMemo(
    () => buildOverviewStats(overview, growth),
    [overview, growth],
  );
  const recent = useMemo(() => getRecentTenants(tenants, 6), [tenants]);

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-14 pb-16 text-foreground">
      <Reveal index={0}>
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">
              Platform
            </p>
            <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.025em]">
              Overview
            </h1>
            <p className="text-sm text-muted-foreground">
              Platform health, SaaS economics and tenant retention at a glance.
            </p>
          </div>
          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-foreground/10 transition-colors hover:bg-foreground/[0.04] hover:text-foreground"
            >
              <RefreshCw
                className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`}
                aria-hidden
              />
              Refresh
            </button>
          ) : null}
        </header>
      </Reveal>

      <OverviewStatStrip stats={stats} />

      <Reveal index={1}>
        <OverviewTenantGrowthChart
          series={growth}
          isPartial={tenantsArePartial}
        />
      </Reveal>

      <Reveal index={2}>
        <div className="grid gap-x-14 gap-y-14 border-t border-foreground/[0.07] pt-12 xl:grid-cols-5">
          <div className="xl:col-span-3">
            <OverviewCohortRetention retention={overview.cohort_retention} />
          </div>
          <div className="xl:col-span-2 xl:border-l xl:border-foreground/[0.07] xl:pl-14">
            <OverviewNdrChart ndr={overview.net_dollar_retention} />
          </div>
        </div>
      </Reveal>

      <Reveal index={3}>
        <div className="grid gap-x-14 gap-y-14 border-t border-foreground/[0.07] pt-12 xl:grid-cols-3">
          <div className={dashboard ? "xl:col-span-2" : "xl:col-span-3"}>
            <OverviewRecentTenants tenants={recent} />
          </div>
          {dashboard ? <OverviewFootprint dashboard={dashboard} /> : null}
        </div>
      </Reveal>

      <Reveal index={4}>
        <div className="border-t border-foreground/[0.07] pt-12">
          <OverviewSection
            title="Finance records"
            description={
              hasOverviewFinanceData(overview)
                ? "Add payments, operating costs and cash balances to keep metrics current."
                : "Record payments and costs to populate revenue, burn rate and runway."
            }
          >
            <PlatformAdminFinanceEntryPanel
              tenants={tenants}
              onRecorded={onFinanceRecorded}
            />
          </OverviewSection>
        </div>
      </Reveal>
    </div>
  );
}

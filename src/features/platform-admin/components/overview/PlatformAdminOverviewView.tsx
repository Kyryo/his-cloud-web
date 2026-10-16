"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo, type ReactNode } from "react";

import { OverviewCohortRetention } from "@/features/platform-admin/components/overview/OverviewCohortRetention";
import { OverviewFootprint } from "@/features/platform-admin/components/overview/OverviewFootprint";
import { OverviewNdrChart } from "@/features/platform-admin/components/overview/OverviewNdrChart";
import { OverviewRecentTenants } from "@/features/platform-admin/components/overview/OverviewRecentTenants";
import { OverviewStatStrip } from "@/features/platform-admin/components/overview/OverviewStatStrip";
import { OverviewTenantGrowthChart } from "@/features/platform-admin/components/overview/OverviewTenantGrowthChart";
import type {
  PlatformAdminDashboard,
  PlatformAdminOverview,
  PlatformAdminTenant,
} from "@/features/platform-admin/types/platform-admin.types";
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
};

/** Presentational platform admin overview; all data is passed in. */
export function PlatformAdminOverviewView({
  overview,
  tenants,
  tenantsArePartial,
  dashboard,
}: PlatformAdminOverviewViewProps) {
  const growth = useMemo(() => buildTenantGrowthSeries(tenants), [tenants]);
  const stats = useMemo(
    () => buildOverviewStats(overview, growth),
    [overview, growth],
  );
  const recent = useMemo(() => getRecentTenants(tenants, 6), [tenants]);

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-14 pb-16 text-foreground">
      <OverviewStatStrip stats={stats} />

      <Reveal index={0}>
        <OverviewTenantGrowthChart
          series={growth}
          isPartial={tenantsArePartial}
        />
      </Reveal>

      <Reveal index={1}>
        <div className="grid gap-x-14 gap-y-14 border-t border-foreground/[0.07] pt-12 xl:grid-cols-5">
          <div className="xl:col-span-3">
            <OverviewCohortRetention retention={overview.cohort_retention} />
          </div>
          <div className="xl:col-span-2 xl:border-l xl:border-foreground/[0.07] xl:pl-14">
            <OverviewNdrChart ndr={overview.net_dollar_retention} />
          </div>
        </div>
      </Reveal>

      <Reveal index={2}>
        <div className="grid gap-x-14 gap-y-14 border-t border-foreground/[0.07] pt-12 xl:grid-cols-3">
          <div className={dashboard ? "xl:col-span-2" : "xl:col-span-3"}>
            <OverviewRecentTenants tenants={recent} />
          </div>
          {dashboard ? <OverviewFootprint dashboard={dashboard} /> : null}
        </div>
      </Reveal>
    </div>
  );
}

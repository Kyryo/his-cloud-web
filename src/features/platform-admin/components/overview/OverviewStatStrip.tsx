"use client";

import { motion, useReducedMotion } from "framer-motion";

import { OverviewDeltaPill } from "@/features/platform-admin/components/overview/OverviewDeltaPill";
import { OverviewSparkline } from "@/features/platform-admin/components/overview/OverviewSparkline";
import type { OverviewStat } from "@/features/platform-admin/utils/overview-stats";

export function OverviewStatStrip({ stats }: { stats: OverviewStat[] }) {
  const reduce = useReducedMotion();
  return (
    <dl className="grid grid-cols-1 border-y border-foreground/[0.07] sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.id}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.35,
            delay: index * 0.05,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="group relative flex min-h-[148px] flex-col justify-between gap-4 border-foreground/[0.07] py-6 max-sm:border-b max-sm:last:border-b-0 sm:px-6 sm:odd:pl-0 sm:even:border-l sm:[&:nth-child(-n+2)]:border-b xl:border-l xl:px-7 xl:first:border-l-0 xl:first:pl-0 xl:[&:nth-child(-n+2)]:border-b-0"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-2">
              <dt className="text-[13px] font-medium text-muted-foreground">
                {stat.label}
              </dt>
              <dd className="text-[34px] font-semibold leading-none tracking-[-0.03em] text-foreground tabular-nums">
                {stat.value}
              </dd>
            </div>
            {stat.sparkline && stat.sparkline.length > 1 ? (
              <OverviewSparkline
                values={stat.sparkline}
                className="mt-6 h-10 w-24 shrink-0 text-primary opacity-90 transition-opacity group-hover:opacity-100"
              />
            ) : null}
          </div>
          <dd className="flex min-h-5 flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {stat.delta ? (
              <OverviewDeltaPill
                delta={stat.delta.value}
                format={stat.delta.format}
              />
            ) : null}
            {stat.caption ? <span>{stat.caption}</span> : null}
          </dd>
        </motion.div>
      ))}
    </dl>
  );
}

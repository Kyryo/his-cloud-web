"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { buildOpdEncounterVitalStats } from "@/features/clinical-opd/utils/opd-encounter-vitals";
import type { EncounterObservation } from "@/features/clinical-opd/types/clinical-opd.types";

const STRIP_GRID_CLASS =
  "grid w-full grid-cols-2 divide-y divide-dash-border/60 border-y border-dash-border/80 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x lg:divide-dash-border/80";

const STAT_CELL_CLASS =
  "px-4 py-2.5 transition-colors hover:bg-dash-canvas/40 sm:px-6 sm:py-3";

type OpdEncounterVitalsStatsStripProps = {
  observations: EncounterObservation[];
  isLoading?: boolean;
  className?: string;
};

export function OpdEncounterVitalsStatsStrip({
  observations,
  isLoading = false,
  className,
}: OpdEncounterVitalsStatsStripProps) {
  if (isLoading) {
    return (
      <div
        className={cn("bg-white", className)}
        data-testid="opd-encounter-vitals-stats-skeleton"
        aria-busy="true"
      >
        <div className={STRIP_GRID_CLASS}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={STAT_CELL_CLASS}>
              <Skeleton className="h-3 w-16" />
              <Skeleton className="mt-2 h-6 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = buildOpdEncounterVitalStats(observations);

  return (
    <div
      className={cn("bg-white", className)}
      data-testid="opd-encounter-vitals-stats"
    >
      <dl className={STRIP_GRID_CLASS}>
        {stats.map((stat) => (
          <div key={stat.key} className={STAT_CELL_CLASS}>
            <div className="flex items-center gap-1.5">
              <span
                className={cn("size-1.5 shrink-0 rounded-full", stat.accentClassName)}
              />
              <dt className="text-[10px] font-semibold uppercase tracking-[0.08em] text-dash-muted">
                {stat.label}
              </dt>
            </div>
            <dd className="mt-1 text-lg font-bold tracking-tight text-brand-navy tabular-nums sm:text-xl">
              {stat.value ?? "—"}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

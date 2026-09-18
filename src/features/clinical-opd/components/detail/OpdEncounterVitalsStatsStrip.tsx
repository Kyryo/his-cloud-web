"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { OpdVitalReading } from "@/features/clinical-opd/components/detail/OpdVitalReading";
import {
  buildOpdEncounterVitalStats,
  formatVitalRecordedLabel,
} from "@/features/clinical-opd/utils/opd-encounter-vitals";
import type { EncounterObservation } from "@/features/clinical-opd/types/clinical-opd.types";
import { cn } from "@/lib/utils";

const STRIP_GRID_CLASS =
  "grid grid-cols-2 gap-px bg-dash-border/70 lg:grid-cols-4";

const STAT_CELL_CLASS = "bg-white px-4 py-4 sm:px-6";

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
        className={cn("border-b border-dash-border/80", className)}
        data-testid="opd-encounter-vitals-stats-skeleton"
        aria-busy="true"
      >
        <div className={STRIP_GRID_CLASS}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={STAT_CELL_CLASS}>
              <Skeleton className="h-3 w-16" />
              <Skeleton className="mt-2 h-7 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = buildOpdEncounterVitalStats(observations);

  return (
    <section
      className={cn("border-b border-dash-border/80", className)}
      aria-label="Latest vital signs"
      data-testid="opd-encounter-vitals-stats"
    >
      <dl className={STRIP_GRID_CLASS}>
        {stats.map((stat) => {
          const recordedLabel = formatVitalRecordedLabel(stat.recordedAt);

          return (
            <div key={stat.key} className={STAT_CELL_CLASS}>
              <dt className="text-xs text-dash-muted">{stat.label}</dt>
              <dd className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <OpdVitalReading
                  value={stat.value}
                  emptyLabel="—"
                  size="sm"
                />
                {recordedLabel ? (
                  <span className="text-xs text-brand-muted">
                    {recordedLabel}
                  </span>
                ) : null}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

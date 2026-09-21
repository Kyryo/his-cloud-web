"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { OpdVitalReading } from "@/features/clinical-opd/components/detail/OpdVitalReading";
import {
  buildOpdEncounterVitalStats,
  formatVitalRecordedLabel,
  latestVitalRecordedAt,
} from "@/features/clinical-opd/utils/opd-encounter-vitals";
import type { EncounterObservation } from "@/features/clinical-opd/types/clinical-opd.types";
import { cn } from "@/lib/utils";

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
        className={cn("border-b border-dash-border/70 bg-white px-4 py-2.5 sm:px-6", className)}
        data-testid="opd-encounter-vitals-stats-skeleton"
        aria-busy="true"
      >
        <div className="flex gap-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-24" />
          ))}
        </div>
      </div>
    );
  }

  const stats = buildOpdEncounterVitalStats(observations);
  const takenLabel = formatVitalRecordedLabel(latestVitalRecordedAt(stats));

  return (
    <section
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-b border-dash-border/70 bg-white px-4 py-2.5 sm:px-6",
        className,
      )}
      aria-label="Latest vital signs"
      data-testid="opd-encounter-vitals-stats"
    >
      <dl className="flex flex-wrap items-start gap-x-8 gap-y-2">
        {stats.map((stat) => (
          <div key={stat.key} className="min-w-0">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-dash-muted">
              {stat.label}
            </dt>
            <dd className="leading-tight">
              <OpdVitalReading
                value={stat.value}
                status={stat.status}
                emptyLabel="—"
                size="sm"
              />
            </dd>
          </div>
        ))}
      </dl>

      {takenLabel ? (
        <p
          className="text-xs text-dash-muted"
          data-testid="opd-encounter-vitals-taken-at"
        >
          Taken {takenLabel}
        </p>
      ) : null}
    </section>
  );
}

"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { OpdVitalReading } from "@/features/clinical-opd/components/detail/OpdVitalReading";
import {
  buildOpdEncounterVitalStats,
} from "@/features/clinical-opd/utils/opd-encounter-vitals";
import type { EncounterObservation } from "@/features/clinical-opd/types/clinical-opd.types";
import { cn } from "@/lib/utils";

type OpdEncounterVitalsStatsStripProps = {
  observations: EncounterObservation[];
  isLoading?: boolean;
  className?: string;
};

const SHORT_LABELS: Record<string, string> = {
  weight: "Wt",
  temperature: "Temp",
  "heart-rate": "HR",
  "blood-pressure": "BP",
};

export function OpdEncounterVitalsStatsStrip({
  observations,
  isLoading = false,
  className,
}: OpdEncounterVitalsStatsStripProps) {
  if (isLoading) {
    return (
      <div
        className={cn("px-4 py-3 sm:px-6", className)}
        data-testid="opd-encounter-vitals-stats-skeleton"
        aria-busy="true"
      >
        <div className="flex gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-6 w-20" />
          ))}
        </div>
      </div>
    );
  }

  const stats = buildOpdEncounterVitalStats(observations);

  return (
    <section
      className={cn("px-4 py-3 sm:px-6", className)}
      aria-label="Latest vital signs"
      data-testid="opd-encounter-vitals-stats"
    >
      <dl className="flex flex-wrap items-baseline gap-x-7 gap-y-2">
        {stats.map((stat) => (
          <div key={stat.key} className="flex items-baseline gap-2">
            <dt className="text-xs text-dash-muted">
              {SHORT_LABELS[stat.key] ?? stat.label}
            </dt>
            <dd>
              <OpdVitalReading value={stat.value} emptyLabel="—" size="sm" />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

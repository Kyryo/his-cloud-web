"use client";

import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { OpdEncounterVitalsDialog } from "@/features/clinical-opd/components/detail/OpdEncounterVitalsDialog";
import { OpdVitalReading } from "@/features/clinical-opd/components/detail/OpdVitalReading";
import {
  buildOpdEncounterVitalStats,
  formatVitalRecordedLabel,
  latestVitalRecordedAt,
} from "@/features/clinical-opd/utils/opd-encounter-vitals";
import type { EncounterObservation } from "@/features/clinical-opd/types/clinical-opd.types";
import { cn } from "@/lib/utils";

type OpdEncounterVitalsStatsStripProps = {
  /** Values shown in the compact strip (may fall back to a prior visit). */
  observations: EncounterObservation[];
  /** This-encounter readings for the View more dialog. */
  encounterObservations?: EncounterObservation[];
  isLoading?: boolean;
  className?: string;
};

export function OpdEncounterVitalsStatsStrip({
  observations,
  encounterObservations,
  isLoading = false,
  className,
}: OpdEncounterVitalsStatsStripProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const dialogObservations = encounterObservations ?? observations;
  const canViewMore = dialogObservations.length > 0;

  if (isLoading) {
    return (
      <div
        className={cn(
          "border-b border-dash-border/70 bg-white px-4 py-2.5 sm:px-6",
          className,
        )}
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
    <>
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

        {takenLabel || canViewMore ? (
          <p
            className="flex flex-wrap items-center gap-x-1.5 text-xs text-dash-muted"
            data-testid="opd-encounter-vitals-taken-at"
          >
            {takenLabel ? <span>Taken {takenLabel}</span> : null}
            {takenLabel && canViewMore ? (
              <span aria-hidden="true">·</span>
            ) : null}
            {canViewMore ? (
              <button
                type="button"
                onClick={() => setDialogOpen(true)}
                className="text-xs font-medium text-brand-muted underline-offset-2 transition-colors hover:text-brand-navy hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                data-testid="opd-encounter-vitals-view-more"
              >
                View more
              </button>
            ) : null}
          </p>
        ) : null}
      </section>

      <OpdEncounterVitalsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        observations={dialogObservations}
      />
    </>
  );
}

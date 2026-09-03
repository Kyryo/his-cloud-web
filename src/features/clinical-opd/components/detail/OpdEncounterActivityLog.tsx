"use client";

import { Activity } from "lucide-react";

import { OpdClinicalTimeline } from "@/features/clinical-opd/components/shared/OpdClinicalTimeline";
import { OpdEncounterTabEmptyState } from "@/features/clinical-opd/components/detail/OpdEncounterTabEmptyState";
import type { ClinicalTimelineEvent } from "@/features/clinical-opd/types/clinical-opd.types";

type OpdEncounterActivityLogProps = {
  events: ClinicalTimelineEvent[];
  isLoading?: boolean;
  title?: string;
  description?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  "data-testid"?: string;
};

export function OpdEncounterActivityLog({
  events,
  isLoading = false,
  title = "Activity",
  description = "Clinical activity for this encounter.",
  emptyTitle = "No activity yet",
  emptyDescription = "Activity will appear here as clinical work is recorded.",
  "data-testid": dataTestId = "opd-activity-log",
}: OpdEncounterActivityLogProps) {
  if (isLoading) {
    return (
      <section
        className="rounded-xl border border-dash-border/80 bg-white px-4 py-3 sm:px-5"
        data-testid={`${dataTestId}-loading`}
        aria-busy="true"
      >
        <h3 className="text-[11px] font-medium uppercase tracking-wide text-brand-muted">
          {title}
        </h3>
        <p className="mt-2 text-sm text-brand-muted">Loading activity…</p>
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <OpdEncounterTabEmptyState
        icon={Activity}
        title={emptyTitle}
        description={emptyDescription}
        data-testid={`${dataTestId}-empty`}
      />
    );
  }

  return (
    <section
      className="rounded-xl border border-dash-border/80 bg-white px-4 py-3 sm:px-5"
      data-testid={dataTestId}
    >
      <h3 className="text-[11px] font-medium uppercase tracking-wide text-brand-muted">
        {title}
      </h3>
      {description ? (
        <p className="mt-0.5 text-xs text-brand-muted">{description}</p>
      ) : null}
      <div className="mt-3">
        <OpdClinicalTimeline events={events} />
      </div>
    </section>
  );
}

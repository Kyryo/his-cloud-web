"use client";

import { OpdClinicalTimeline } from "@/features/clinical-opd/components/shared/OpdClinicalTimeline";
import type { ClinicalTimelineEvent } from "@/features/clinical-opd/types/clinical-opd.types";

type OpdEncounterActivityLogProps = {
  events: ClinicalTimelineEvent[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  "data-testid"?: string;
};

export function OpdEncounterActivityLog({
  events,
  isLoading = false,
  emptyTitle = "No activity yet",
  emptyDescription = "Activity will appear here as clinical work is recorded.",
  "data-testid": dataTestId = "opd-activity-log",
}: OpdEncounterActivityLogProps) {
  if (isLoading) {
    return (
      <div data-testid={`${dataTestId}-loading`} aria-busy="true">
        <p className="text-sm text-brand-muted">Loading activity…</p>
      </div>
    );
  }

  return (
    <OpdClinicalTimeline
      events={events}
      title={null}
      description={null}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      data-testid={dataTestId}
    />
  );
}

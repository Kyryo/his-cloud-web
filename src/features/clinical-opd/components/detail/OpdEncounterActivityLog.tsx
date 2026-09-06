"use client";

import { Activity } from "lucide-react";

import { OpdClinicalTimeline } from "@/features/clinical-opd/components/shared/OpdClinicalTimeline";
import { OpdEncounterTabEmptyState } from "@/features/clinical-opd/components/detail/OpdEncounterTabEmptyState";
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
    <div data-testid={dataTestId}>
      <OpdClinicalTimeline events={events} />
    </div>
  );
}

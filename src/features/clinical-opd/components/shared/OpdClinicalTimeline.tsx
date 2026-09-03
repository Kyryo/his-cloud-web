"use client";

import {
  Activity,
  ClipboardList,
  FileText,
  FlaskConical,
  History,
  NotebookPen,
  Pill,
  Scan,
  Stethoscope,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  ActivityFeed,
  type ActivityFeedItem,
} from "@/components/feed/activity-feed";
import type { ActivityIconTone } from "@/components/detail/detail-activity-timeline-utils";
import type { ClinicalTimelineEvent } from "@/features/clinical-opd/types/clinical-opd.types";

const EVENT_ICONS: Record<string, LucideIcon> = {
  observation: Activity,
  nursing_note: NotebookPen,
  physical_exam: Stethoscope,
  diagnosis: ClipboardList,
  clinical_note: FileText,
  order: FlaskConical,
  prescription: Pill,
  clinical_activity: History,
  encounter_status: History,
  radiology: Scan,
};

const EVENT_TONES: Record<string, ActivityIconTone> = {
  observation: "info",
  nursing_note: "neutral",
  physical_exam: "info",
  diagnosis: "warning",
  clinical_note: "neutral",
  order: "info",
  prescription: "success",
  radiology: "info",
  encounter_status: "neutral",
};

function mapClinicalEventToFeedItem(
  event: ClinicalTimelineEvent,
): ActivityFeedItem {
  const title = event.type.replaceAll("_", " ");
  return {
    id: `${event.type}-${event.object_uuid}-${event.occurred_at}`,
    title: title.charAt(0).toUpperCase() + title.slice(1),
    summary: event.summary,
    occurredAt: event.occurred_at,
    icon: EVENT_ICONS[event.type] ?? History,
    tone: EVENT_TONES[event.type] ?? "neutral",
    groupKey: event.type,
    createdByName: event.actor,
  };
}

export function OpdClinicalTimeline({
  events,
}: {
  events: ClinicalTimelineEvent[];
}) {
  return (
    <ActivityFeed
      title={null}
      description={null}
      items={events.map(mapClinicalEventToFeedItem)}
      emptyTitle="No timeline events yet"
      emptyDescription="Clinical activity for this encounter will appear here."
      enableFilters={false}
      compact={false}
      data-testid="opd-clinical-timeline"
    />
  );
}

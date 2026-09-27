"use client";

import {
  Activity,
  AlertTriangle,
  ClipboardList,
  FileText,
  FlaskConical,
  History,
  NotebookPen,
  Pill,
  PlayCircle,
  Scan,
  Share2,
  Stethoscope,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  ActivityFeed,
  type ActivityFeedItem,
} from "@/components/feed/activity-feed";
import type { ActivityIconTone } from "@/components/detail/detail-activity-timeline-utils";
import type { ClinicalTimelineEvent } from "@/features/clinical-opd/types/clinical-opd.types";
import { cn } from "@/lib/utils";

const EVENT_ICONS: Record<string, LucideIcon> = {
  observation: Activity,
  nursing_note: NotebookPen,
  physical_exam: Stethoscope,
  diagnosis: ClipboardList,
  clinical_note: FileText,
  order: FlaskConical,
  order_cancelled: FlaskConical,
  prescription: Pill,
  clinical_activity: History,
  encounter_status: History,
  radiology: Scan,
  visit_started: PlayCircle,
  chief_complaint: ClipboardList,
  hpi: FileText,
  allergy: AlertTriangle,
  problem: ClipboardList,
  disposition: History,
  current_medication: Pill,
  referral: Share2,
};

const EVENT_TONES: Record<string, ActivityIconTone> = {
  observation: "info",
  nursing_note: "neutral",
  physical_exam: "info",
  diagnosis: "warning",
  clinical_note: "neutral",
  order: "info",
  order_cancelled: "danger",
  prescription: "success",
  radiology: "info",
  encounter_status: "neutral",
  visit_started: "success",
  chief_complaint: "info",
  hpi: "info",
  allergy: "warning",
  problem: "warning",
  disposition: "neutral",
  current_medication: "info",
  referral: "info",
};

const EVENT_TITLES: Record<string, string> = {
  observation: "Vital signs recorded",
  nursing_note: "Nursing note recorded",
  physical_exam: "Physical examination recorded",
  diagnosis: "Diagnosis recorded",
  clinical_note: "Clinical note recorded",
  order: "Order placed",
  order_cancelled: "Order cancelled",
  prescription: "Medication prescribed",
  clinical_activity: "Clinical activity",
  encounter_status: "Encounter update",
  radiology: "Radiology order",
  visit_started: "Visit started",
  chief_complaint: "Chief complaint recorded",
  hpi: "History of present illness recorded",
  allergy: "Allergy recorded",
  problem: "Problem recorded",
  disposition: "Disposition recorded",
  current_medication: "Current medication recorded",
  referral: "Lab referral",
};

function titleForEvent(type: string): string {
  if (EVENT_TITLES[type]) {
    return EVENT_TITLES[type];
  }
  const label = type.replaceAll("_", " ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function mapClinicalEventToFeedItem(
  event: ClinicalTimelineEvent,
): ActivityFeedItem {
  const summary = (event.summary || "").trim();
  // Prefer the server narration as the feed title so we never surface
  // specific notes, codes, or ordered item names in the timeline.
  const title = summary || titleForEvent(event.type);
  return {
    id: `${event.type}-${event.object_uuid}-${event.occurred_at}`,
    title,
    summary: summary && summary.toLowerCase() !== title.toLowerCase() ? summary : "",
    occurredAt: event.occurred_at,
    icon: EVENT_ICONS[event.type] ?? History,
    tone: EVENT_TONES[event.type] ?? "neutral",
    groupKey: event.type,
    createdByName: event.actor,
  };
}

type OpdClinicalTimelineProps = {
  events: ClinicalTimelineEvent[];
  title?: string | null;
  description?: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
  "data-testid"?: string;
};

/**
 * Encounter-scoped clinical activity feed.
 * Matches the client Activity tab visual system (shared ActivityFeed).
 */
export function OpdClinicalTimeline({
  events,
  title = null,
  description = null,
  emptyTitle = "No clinical activity yet",
  emptyDescription = "Clinical events for this encounter will appear here as they are recorded.",
  className,
  "data-testid": dataTestId = "opd-clinical-timeline",
}: OpdClinicalTimelineProps) {
  return (
    <ActivityFeed
      className={cn(
        "[&_h3]:text-sm [&_h3]:font-semibold [&_[data-testid=activity-feed-list]]:px-2 sm:[&_[data-testid=activity-feed-list]]:px-3",
        "[&_h3+p]:text-[13px]",
        className,
      )}
      title={title}
      description={description}
      items={events.map(mapClinicalEventToFeedItem)}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      enableFilters={false}
      compact
      data-testid={dataTestId}
    />
  );
}

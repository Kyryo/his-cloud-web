"use client";

import {
  History,
  MapPin,
  NotebookPen,
  Shield,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  DetailActivityTimeline,
  type DetailActivityTimelineItem,
} from "@/components/detail/detail-activity-timeline";
import type { CustomerEncounter } from "@/features/customers/types/customer-encounter.types";
import { cn } from "@/lib/utils";

type CustomerActivityTimelineProps = {
  encounters: CustomerEncounter[];
  hasMore: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  className?: string;
};

const ACTION_ICONS: Record<string, LucideIcon> = {
  CUSTOMER_CREATED: UserRound,
  CUSTOMER_UPDATED: UserRound,
  CUSTOMER_ARCHIVED: UserRound,
  INSURANCE_ADDED: Shield,
  INSURANCE_UPDATED: Shield,
  INSURANCE_ARCHIVED: Shield,
  ADDRESS_ADDED: MapPin,
  ADDRESS_UPDATED: MapPin,
  ADDRESS_ARCHIVED: MapPin,
  NOTE_ADDED: NotebookPen,
  NOTE_UPDATED: NotebookPen,
  NOTE_ARCHIVED: NotebookPen,
};

function getEncounterIcon(action: string): LucideIcon {
  return ACTION_ICONS[action] ?? History;
}

function mapEncounterToTimelineItem(
  encounter: CustomerEncounter,
): DetailActivityTimelineItem {
  return {
    id: encounter.uuid,
    title: encounter.action_display,
    summary: encounter.summary,
    occurredAt: encounter.occurred_at,
    icon: getEncounterIcon(encounter.action),
    createdByName: encounter.actor_name,
    createdByEmail: encounter.actor_email,
  };
}

export function CustomerActivityTimeline({
  encounters,
  hasMore,
  isLoadingMore = false,
  onLoadMore,
  className,
}: CustomerActivityTimelineProps) {
  return (
    <DetailActivityTimeline
      className={cn(className)}
      title="Activity"
      description="Recent events recorded for this client."
      items={encounters.map(mapEncounterToTimelineItem)}
      hasMore={hasMore}
      isLoadingMore={isLoadingMore}
      onLoadMore={onLoadMore}
      data-testid="customer-activity-timeline"
    />
  );
}

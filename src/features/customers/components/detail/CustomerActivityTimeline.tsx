"use client";

import {
  Activity,
  CheckCircle2,
  CircleCheck,
  FileText,
  History,
  MapPin,
  NotebookPen,
  Receipt,
  Send,
  Shield,
  ShieldCheck,
  ShoppingCart,
  Tag,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  ActivityFeed,
  type ActivityFeedItem,
  type ActivityFeedPagination,
} from "@/components/feed/activity-feed";
import type { ActivityIconTone } from "@/components/detail/detail-activity-timeline-utils";
import type { CustomerEncounter } from "@/features/customers/types/customer-encounter.types";
import { formatCustomerActivityCopy } from "@/features/customers/utils/format-customer-activity-copy";
import { cn } from "@/lib/utils";

type CustomerActivityTimelineProps = {
  encounters: CustomerEncounter[];
  pagination: ActivityFeedPagination;
  className?: string;
};

const ACTION_ICONS: Record<string, LucideIcon> = {
  CUSTOMER_CREATED: UserRound,
  CUSTOMER_UPDATED: UserRound,
  CUSTOMER_ARCHIVED: UserRound,
  OPENING_BALANCE_UPDATED: Wallet,
  INSURANCE_ADDED: Shield,
  INSURANCE_UPDATED: Shield,
  INSURANCE_ARCHIVED: Shield,
  ADDRESS_ADDED: MapPin,
  ADDRESS_UPDATED: MapPin,
  ADDRESS_ARCHIVED: MapPin,
  NOTE_ADDED: NotebookPen,
  NOTE_UPDATED: NotebookPen,
  NOTE_ARCHIVED: NotebookPen,
  GUARDIAN_ADDED: Users,
  GUARDIAN_UPDATED: Users,
  GUARDIAN_ARCHIVED: Users,
  TAG_ASSIGNED: Tag,
  TAG_REMOVED: Tag,
  VISIT_CREATED: Activity,
  VISIT_UPDATED: Activity,
  ORDER_ADDED: ShoppingCart,
  ORDER_CONFIRMED: CheckCircle2,
  ORDER_INVOICED: Receipt,
  ORDER_CANCELLED: History,
  ORDER_LINE_ADDED: ShoppingCart,
  INVOICE_CREATED: FileText,
  INVOICE_CANCELLED: History,
  PAYMENT_RECORDED: Wallet,
  PAYMENT_CANCELLED: History,
  CLAIM_CREATED: FileText,
  CLAIM_SUBMITTED: Send,
  CLAIM_UPDATED: FileText,
  CLAIM_ADVISORIES_EVALUATED: ShieldCheck,
  CLAIM_ADVISORY_CLEARED: CircleCheck,
  CLAIM_ADVISORY_OVERRIDE: Shield,
  CLAIM_ADVISORY_APPLIED: CheckCircle2,
};

const ACTION_TONES: Record<string, ActivityIconTone> = {
  CUSTOMER_CREATED: "info",
  CUSTOMER_ARCHIVED: "danger",
  INSURANCE_ADDED: "info",
  INSURANCE_ARCHIVED: "danger",
  NOTE_ADDED: "neutral",
  VISIT_CREATED: "success",
  VISIT_UPDATED: "info",
  TAG_ASSIGNED: "info",
  TAG_REMOVED: "warning",
  CLAIM_CREATED: "info",
  CLAIM_SUBMITTED: "info",
  CLAIM_ADVISORIES_EVALUATED: "warning",
  CLAIM_ADVISORY_CLEARED: "success",
  PAYMENT_RECORDED: "success",
};

function getEncounterIcon(action: string): LucideIcon {
  return ACTION_ICONS[action] ?? History;
}

function mapEncounterToFeedItem(
  encounter: CustomerEncounter,
): ActivityFeedItem {
  const copy = formatCustomerActivityCopy(encounter);
  return {
    id: encounter.uuid,
    title: copy.title,
    summary: copy.summary,
    occurredAt: encounter.occurred_at,
    icon: getEncounterIcon(encounter.action),
    tone: ACTION_TONES[encounter.action] ?? "neutral",
    groupKey: encounter.action,
    createdByName: encounter.actor_name,
    createdByEmail: encounter.actor_email,
  };
}

/**
 * Client-scoped activity timeline.
 * Uses the shared ActivityFeed visual system (same as Notifications).
 */
export function CustomerActivityTimeline({
  encounters,
  pagination,
  className,
}: CustomerActivityTimelineProps) {
  return (
    <ActivityFeed
      className={cn(
        "[&_[data-testid=activity-feed-list]]:px-2 sm:[&_[data-testid=activity-feed-list]]:px-3",
        className,
      )}
      title="Activity"
      description="A timeline of events recorded for this client."
      items={encounters.map(mapEncounterToFeedItem)}
      pagination={pagination}
      emptyTitle="No activity yet"
      emptyDescription="Events such as profile updates, insurance changes, and notes will appear here as they happen."
      compact={false}
      data-testid="customer-activity-timeline"
    />
  );
}

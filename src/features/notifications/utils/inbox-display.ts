import { differenceInCalendarDays, formatDistance, isSameDay, startOfWeek } from "date-fns";

import type { AppIconName } from "@/components/icons/app-icon";
import {
  moduleDisplayNames,
  moduleIcons,
} from "@/features/app-shell/constants/navigation-config";
import type { InboxItem } from "@/features/notifications/types/inbox.types";

export const INBOX_DATE_GROUP_ORDER = [
  "Today",
  "Yesterday",
  "Earlier this week",
  "Earlier",
] as const;

export type InboxDateGroupLabel = (typeof INBOX_DATE_GROUP_ORDER)[number];

export type InboxDateGroup = {
  label: InboxDateGroupLabel;
  items: InboxItem[];
};

const EVENT_SINGLE_DESCRIPTION: Record<string, string> = {
  ready_for_submission:
    "The claim passed requirements and advisory checks and is ready to be submitted.",
  needs_attention: "Review the findings before submitting this claim.",
  submitted: "The claim was submitted successfully.",
  requires_manual_submission: "This claim needs to be submitted manually.",
};

const MODULE_ALIASES: Record<string, { label: string; icon: AppIconName }> = {
  payments: { label: "Payments", icon: "creditCard" },
  laboratory: { label: "Laboratory", icon: "flask" },
};

function matchModuleKey(moduleName: string): string | undefined {
  const normalized = moduleName.trim().toLowerCase();
  return Object.keys(moduleIcons).find(
    (name) => name.toLowerCase() === normalized,
  );
}

export function inboxModuleLabel(moduleName: string): string {
  const key = matchModuleKey(moduleName);
  if (key) {
    return moduleDisplayNames[key] ?? key;
  }
  const alias = MODULE_ALIASES[moduleName.trim().toLowerCase()];
  if (alias) {
    return alias.label;
  }
  if (!moduleName.trim()) {
    return "General";
  }
  return moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
}

export function inboxModuleIcon(moduleName: string): AppIconName {
  const key = matchModuleKey(moduleName);
  if (key) {
    return moduleIcons[key];
  }
  const alias = MODULE_ALIASES[moduleName.trim().toLowerCase()];
  if (alias) {
    return alias.icon;
  }
  return "notification";
}

export function inboxItemDescription(item: InboxItem): string {
  const body = item.body.trim();
  const title = item.title.trim();
  if (item.item_count > 1 && body && body !== title) {
    return body;
  }
  if (body && body !== title) {
    return body;
  }
  return EVENT_SINGLE_DESCRIPTION[item.event_type] ?? body ?? title;
}

export function inboxRelativeTime(occurredAt: string, now = new Date()): string {
  return formatDistance(new Date(occurredAt), now, { addSuffix: true });
}

export function inboxDateGroupLabel(
  occurredAt: string,
  now = new Date(),
): InboxDateGroupLabel {
  const date = new Date(occurredAt);
  if (isSameDay(date, now)) {
    return "Today";
  }
  if (differenceInCalendarDays(now, date) === 1) {
    return "Yesterday";
  }
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  if (date >= weekStart) {
    return "Earlier this week";
  }
  return "Earlier";
}

export function groupInboxItemsByDate(
  items: InboxItem[],
  now = new Date(),
): InboxDateGroup[] {
  const buckets = new Map<InboxDateGroupLabel, InboxItem[]>();
  for (const label of INBOX_DATE_GROUP_ORDER) {
    buckets.set(label, []);
  }
  for (const item of items) {
    const label = inboxDateGroupLabel(item.occurred_at, now);
    buckets.get(label)?.push(item);
  }
  return INBOX_DATE_GROUP_ORDER.flatMap((label) => {
    const grouped = buckets.get(label) ?? [];
    return grouped.length > 0 ? [{ label, items: grouped }] : [];
  });
}

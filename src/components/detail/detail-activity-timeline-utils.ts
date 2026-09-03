import { formatDistance } from "date-fns";
import type { LucideIcon } from "lucide-react";

export type ActivityIconTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "upcoming";

export type DetailActivityTimelineItem = {
  id: string;
  title: string;
  summary: string;
  occurredAt: string;
  icon: LucideIcon;
  /** Subtle marker color for activity-type scanning. */
  tone?: ActivityIconTone;
  createdByName?: string | null;
  createdByEmail?: string | null;
  /** Stable key for consecutive identical-event grouping. Defaults to title. */
  groupKey?: string;
};

export type DetailActivityDateGroupLabel =
  | "Upcoming"
  | "Today"
  | "Yesterday"
  | "Earlier this week"
  | "Earlier"
  | string;

export type DetailActivityDateGroup = {
  key: string;
  label: DetailActivityDateGroupLabel;
  items: DetailActivityTimelineItem[];
};

export type DetailActivityGroupedEntry =
  | {
      kind: "single";
      id: string;
      item: DetailActivityTimelineItem;
    }
  | {
      kind: "cluster";
      id: string;
      groupKey: string;
      title: string;
      icon: LucideIcon;
      tone?: ActivityIconTone;
      items: DetailActivityTimelineItem[];
    };

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseOccurredAt(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatActivityTime(value: string): string {
  const date = parseOccurredAt(value);
  if (!date) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatActivityFullTimestamp(value: string): string {
  const date = parseOccurredAt(value);
  if (!date) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

/**
 * Compact relative/contextual timestamp for timeline rows.
 * Mirrors notification feed relative time for a consistent look.
 */
export function formatActivityRelativeLabel(
  value: string,
  groupLabel?: DetailActivityDateGroupLabel,
  now = new Date(),
): string {
  const date = parseOccurredAt(value);
  if (!date) {
    return value;
  }

  const dayMs = 24 * 60 * 60 * 1000;
  const dayDiff = Math.round(
    (startOfLocalDay(date).getTime() - startOfLocalDay(now).getTime()) / dayMs,
  );

  if (groupLabel === "Upcoming" || dayDiff > 0) {
    if (dayDiff === 1) {
      return "Tomorrow";
    }
    if (dayDiff > 1 && dayDiff <= 7) {
      return new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(
        date,
      );
    }
    return formatActivityTime(value);
  }

  // Same relative phrasing as notifications for all past items.
  return formatDistance(date, now, { addSuffix: true });
}

export function getActivityItemGroupKey(item: DetailActivityTimelineItem): string {
  return item.groupKey?.trim() || item.title.trim();
}

function getDateGroupLabel(date: Date, now: Date): DetailActivityDateGroupLabel {
  const day = startOfLocalDay(date).getTime();
  const today = startOfLocalDay(now).getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((day - today) / dayMs);

  if (diffDays > 0) {
    return "Upcoming";
  }
  if (diffDays === 0) {
    return "Today";
  }
  if (diffDays === -1) {
    return "Yesterday";
  }

  const startOfWeek = startOfLocalDay(now);
  startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7));
  if (day >= startOfWeek.getTime()) {
    return "Earlier this week";
  }

  return "Earlier";
}

function getDateGroupKey(date: Date, now: Date): string {
  return getDateGroupLabel(date, now);
}

/** Group timeline items into date sections while preserving chronological order. */
export function groupActivityItemsByDate(
  items: DetailActivityTimelineItem[],
  now = new Date(),
): DetailActivityDateGroup[] {
  const groups: DetailActivityDateGroup[] = [];
  const indexByKey = new Map<string, number>();

  for (const item of items) {
    const occurredAt = parseOccurredAt(item.occurredAt) ?? now;
    const key = getDateGroupKey(occurredAt, now);
    const existingIndex = indexByKey.get(key);

    if (existingIndex === undefined) {
      indexByKey.set(key, groups.length);
      groups.push({
        key,
        label: getDateGroupLabel(occurredAt, now),
        items: [item],
      });
      continue;
    }

    groups[existingIndex].items.push(item);
  }

  return groups;
}

/**
 * Collapse consecutive identical activities (same groupKey/title) into clusters.
 * Presentation-only — does not change underlying activity records.
 */
export function clusterConsecutiveActivityItems(
  items: DetailActivityTimelineItem[],
): DetailActivityGroupedEntry[] {
  const entries: DetailActivityGroupedEntry[] = [];

  for (const item of items) {
    const key = getActivityItemGroupKey(item);
    const previous = entries[entries.length - 1];

    if (
      previous?.kind === "cluster" &&
      previous.groupKey === key &&
      previous.title === item.title
    ) {
      previous.items.push(item);
      continue;
    }

    if (
      previous?.kind === "single" &&
      getActivityItemGroupKey(previous.item) === key &&
      previous.item.title === item.title
    ) {
      entries[entries.length - 1] = {
        kind: "cluster",
        id: `cluster-${previous.item.id}-${item.id}`,
        groupKey: key,
        title: item.title,
        icon: item.icon,
        tone: item.tone ?? previous.item.tone,
        items: [previous.item, item],
      };
      continue;
    }

    entries.push({
      kind: "single",
      id: item.id,
      item,
    });
  }

  return entries;
}

export function formatActivityClusterRange(
  items: DetailActivityTimelineItem[],
): string {
  if (items.length === 0) {
    return "";
  }

  const newest = items[0];
  const oldest = items[items.length - 1];
  const newestTime = formatActivityTime(newest.occurredAt);
  const oldestTime = formatActivityTime(oldest.occurredAt);

  if (oldestTime === newestTime) {
    return newestTime;
  }

  return `between ${oldestTime} and ${newestTime}`;
}

export function getActivityActorLabel(
  createdByName?: string | null,
  createdByEmail?: string | null,
): string | null {
  const name = createdByName?.trim();
  if (name && name.toLowerCase() !== "none none" && name.toLowerCase() !== "none") {
    return name;
  }

  const email = createdByEmail?.trim();
  return email || null;
}

export function pluralizeActivityTitle(title: string, count: number): string {
  if (count <= 1) {
    return title;
  }

  const normalized = title.trim();
  if (/ies$/i.test(normalized)) {
    return `${count} ${normalized}`;
  }
  if (/s$/i.test(normalized)) {
    return `${count} ${normalized}`;
  }
  return `${count} ${normalized}`;
}

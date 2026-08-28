"use client";

import { AppIcon } from "@/components/icons/app-icon";
import type { InboxItem } from "@/features/notifications/types/inbox.types";
import {
  groupInboxItemsByDate,
  inboxItemDescription,
  inboxModuleIcon,
  inboxModuleLabel,
  inboxRelativeTime,
  type InboxDateGroupLabel,
} from "@/features/notifications/utils/inbox-display";
import { cn } from "@/lib/utils";

type InboxActivityFeedProps = {
  items: InboxItem[];
  onOpen: (item: InboxItem) => void;
  now?: Date;
};

export function InboxActivityFeed({
  items,
  onOpen,
  now,
}: InboxActivityFeedProps) {
  const groups = groupInboxItemsByDate(items, now);

  return (
    <div className="space-y-5" data-testid="inbox-activity-feed">
      {groups.map((group) => (
        <section
          key={group.label}
          aria-labelledby={`inbox-group-${slugifyGroup(group.label)}`}
        >
          <InboxDateSeparator label={group.label} />
          <ol className="mt-1">
            {group.items.map((item, index) => (
              <li key={item.id}>
                <InboxActivityItem
                  item={item}
                  showConnector={index < group.items.length - 1}
                  onOpen={onOpen}
                  now={now}
                />
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

function InboxDateSeparator({ label }: { label: InboxDateGroupLabel }) {
  const headingId = `inbox-group-${slugifyGroup(label)}`;
  return (
    <div
      className="flex items-center gap-3"
      data-testid="inbox-date-group"
      data-group={label}
    >
      <div className="h-px flex-1 bg-dash-border" />
      <h2
        id={headingId}
        className="rounded-full border border-dash-border bg-white px-2.5 py-0.5 text-xs font-medium text-dash-muted"
      >
        {label}
      </h2>
      <div className="h-px flex-1 bg-dash-border" />
    </div>
  );
}

type InboxActivityItemProps = {
  item: InboxItem;
  showConnector: boolean;
  onOpen: (item: InboxItem) => void;
  now?: Date;
};

function InboxActivityItem({
  item,
  showConnector,
  onOpen,
  now,
}: InboxActivityItemProps) {
  const description = inboxItemDescription(item);
  const moduleLabel = inboxModuleLabel(item.module);
  const unread = !item.is_read;

  return (
    <button
      type="button"
      className={cn(
        "relative flex w-full gap-3 rounded-xl px-2 py-2.5 text-left transition-colors sm:px-3",
        "hover:bg-dash-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/25",
        unread && "bg-brand-tint/45 hover:bg-brand-tint/70",
      )}
      onClick={() => onOpen(item)}
      data-testid="inbox-item"
      data-read={item.is_read ? "true" : "false"}
      data-href={item.href}
      aria-label={
        unread
          ? `Unread notification: ${item.title}`
          : item.title
      }
    >
      <span className="relative flex w-8 shrink-0 flex-col items-center self-stretch">
        <span
          className={cn(
            "relative z-10 flex size-8 items-center justify-center rounded-full",
            "bg-brand-tint text-brand-primary",
          )}
        >
          <AppIcon name={inboxModuleIcon(item.module)} size={15} />
          {unread ? (
            <span
              className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-brand-primary ring-2 ring-white"
              aria-hidden="true"
              data-testid="inbox-item-unread-dot"
            />
          ) : null}
        </span>
        {showConnector ? (
          <span
            className="mt-1 w-px flex-1 bg-dash-border"
            aria-hidden="true"
          />
        ) : null}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-sm text-brand-navy",
            unread ? "font-semibold" : "font-medium text-brand-navy/90",
          )}
        >
          {item.title}
        </span>
        {description ? (
          <span className="mt-0.5 block text-sm leading-5 text-brand-muted">
            {description}
          </span>
        ) : null}
        <span className="mt-1 block text-xs text-dash-muted">
          {moduleLabel}
          <span aria-hidden="true"> · </span>
          {inboxRelativeTime(item.occurred_at, now)}
        </span>
      </span>
    </button>
  );
}

function slugifyGroup(label: InboxDateGroupLabel): string {
  return label.toLowerCase().replace(/\s+/g, "-");
}

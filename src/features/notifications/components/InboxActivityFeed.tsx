"use client";

import { AppIcon } from "@/components/icons/app-icon";
import {
  FeedGroup,
  FeedItem,
  FeedList,
} from "@/components/feed/feed-timeline";
import type { InboxItem } from "@/features/notifications/types/inbox.types";
import {
  groupInboxItemsByDate,
  inboxItemDescription,
  inboxModuleIcon,
  inboxModuleLabel,
  inboxRelativeTime,
} from "@/features/notifications/utils/inbox-display";

type InboxActivityFeedProps = {
  items: InboxItem[];
  onOpen: (item: InboxItem) => void;
  now?: Date;
  /** Denser layout for embedding under detail sections. */
  compact?: boolean;
  className?: string;
};

export function InboxActivityFeed({
  items,
  onOpen,
  now,
  compact = false,
  className,
}: InboxActivityFeedProps) {
  const groups = groupInboxItemsByDate(items, now);

  return (
    <FeedList
      compact={compact}
      className={className}
      data-testid="inbox-activity-feed"
    >
      {groups.map((group) => (
        <FeedGroup
          key={group.label}
          label={group.label}
          compact={compact}
          dateTestId="inbox-date-group"
        >
          {group.items.map((item, index) => {
            const description = inboxItemDescription(item);
            const moduleLabel = inboxModuleLabel(item.module);
            const unread = !item.is_read;

            return (
              <li key={item.id}>
                <FeedItem
                  title={item.title}
                  description={description}
                  meta={moduleLabel}
                  occurredAt={item.occurred_at}
                  relativeTime={inboxRelativeTime(item.occurred_at, now)}
                  icon={
                    <AppIcon
                      name={inboxModuleIcon(item.module)}
                      size={compact ? 12 : 15}
                    />
                  }
                  showConnector={index < group.items.length - 1}
                  compact={compact}
                  emphasized={unread}
                  showEmphasisDot={unread}
                  emphasisDotTestId="inbox-item-unread-dot"
                  onClick={() => onOpen(item)}
                  data-testid="inbox-item"
                  data-read={item.is_read ? "true" : "false"}
                  data-href={item.href}
                  aria-label={
                    unread
                      ? `Unread notification: ${item.title}`
                      : item.title
                  }
                />
              </li>
            );
          })}
        </FeedGroup>
      ))}
    </FeedList>
  );
}

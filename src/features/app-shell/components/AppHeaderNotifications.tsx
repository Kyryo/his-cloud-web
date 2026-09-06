"use client";

import { useState } from "react";

import { AppIcon } from "@/components/icons/app-icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { NotificationsPanel } from "@/features/notifications/components/NotificationsPanel";
import { useInboxUnreadCount } from "@/features/notifications/hooks/use-inbox-unread-count";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

function unreadLabel(count: number) {
  if (count <= 0) {
    return "Notifications";
  }
  if (count > 99) {
    return "Notifications, 99+ unread";
  }
  return `Notifications, ${count} unread`;
}

export function AppHeaderNotifications() {
  const [open, setOpen] = useState(false);
  const unreadCount = useInboxUnreadCount(true, { notifyOnNew: true });
  const badgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-testid="app-header-notifications-trigger"
          aria-label={unreadLabel(unreadCount)}
          className={cn(
            "relative flex size-8 items-center justify-center rounded-lg text-dash-muted",
            "transition-colors hover:bg-white hover:text-brand-navy",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/25",
            "data-[state=open]:bg-white data-[state=open]:text-brand-navy",
          )}
        >
          <AppIcon name="notification" size={18} />
          {unreadCount > 0 ? (
            <span
              data-testid="app-header-notifications-badge"
              className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-primary px-1 text-[10px] font-semibold leading-none text-white"
            >
              {badgeLabel}
            </span>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className={cn(appFont.className, "w-80 overflow-hidden p-0")}
        data-testid="app-header-notifications-popover"
      >
        <NotificationsPanel
          enabled={open}
          maxItems={6}
          pageSize={12}
          compact
          className="rounded-none border-0"
          emptyTitle="You're all caught up"
          emptyDescription="New notifications will show up here."
          data-testid="app-header-notifications-panel"
        />
      </PopoverContent>
    </Popover>
  );
}

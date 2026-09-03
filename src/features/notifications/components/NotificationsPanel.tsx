"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { InboxActivityFeed } from "@/features/notifications/components/InboxActivityFeed";
import { useInboxItems } from "@/features/notifications/hooks/use-inbox-items";
import { markInboxItemRead } from "@/features/notifications/services/inbox.service";
import type { InboxItem } from "@/features/notifications/types/inbox.types";
import {
  filterInboxItemsForCustomer,
  type InboxCustomerMatchInput,
} from "@/features/notifications/utils/inbox-customer-match";
import { cn } from "@/lib/utils";

type NotificationsPanelProps = {
  /** When set, only show notifications related to this customer. */
  customer?: InboxCustomerMatchInput | null;
  /** Skip fetch until the host tab/section is active. */
  enabled?: boolean;
  title?: ReactNode;
  description?: string | null;
  /** Max items to show in embedded contexts. */
  maxItems?: number;
  /** Fetch page size before client-side filtering. */
  pageSize?: number;
  /** Compact feed styling for detail pages. */
  compact?: boolean;
  /** Show link to the full inbox page. */
  showViewAll?: boolean;
  /** Hide the panel entirely when there are no matching items (after load). */
  hideWhenEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
  "data-testid"?: string;
};

export function NotificationsPanelSkeleton({
  rows = 4,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-dash-border/80 bg-white px-4 py-3.5 sm:px-5",
        className,
      )}
      aria-busy="true"
      data-testid="notifications-panel-skeleton"
    >
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-7 w-16 rounded-md" />
      </div>
      <div className="mt-4 space-y-3">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex gap-2.5">
            <Skeleton className="size-[22px] shrink-0 rounded-[6px]" />
            <div className="min-w-0 flex-1 space-y-1">
              <Skeleton className="h-3.5 w-3/5" />
              <Skeleton className="h-3 w-2/5" />
            </div>
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function NotificationsPanel({
  customer = null,
  enabled = true,
  title = "Notifications",
  description = null,
  maxItems = 8,
  pageSize = 40,
  compact = true,
  showViewAll = true,
  hideWhenEmpty = false,
  emptyTitle = "No notifications",
  emptyDescription = "Updates related to this record will appear here.",
  className,
  "data-testid": testId = "notifications-panel",
}: NotificationsPanelProps) {
  const router = useRouter();
  const { items, isLoading, error, reload } = useInboxItems({
    enabled,
    page: 1,
    pageSize,
  });

  const matchedItems = useMemo(() => {
    const scoped = customer
      ? filterInboxItemsForCustomer(items, customer)
      : items;
    return scoped.slice(0, maxItems);
  }, [customer, items, maxItems]);

  const unreadCount = useMemo(
    () => matchedItems.filter((item) => !item.is_read).length,
    [matchedItems],
  );

  async function handleOpen(item: InboxItem) {
    if (!item.is_read) {
      try {
        await markInboxItemRead(item.id);
      } catch {
        // Navigation still proceeds if mark-read fails.
      }
    }
    router.push(item.href);
  }

  if (!enabled) {
    return null;
  }

  if (isLoading) {
    return <NotificationsPanelSkeleton className={className} />;
  }

  if (hideWhenEmpty && !error && matchedItems.length === 0) {
    return null;
  }

  return (
    <section
      className={cn(
        "rounded-xl border border-dash-border/80 bg-white",
        className,
      )}
      data-testid={testId}
    >
      <div className="flex items-center justify-between gap-3 border-b border-dash-border/80 px-4 py-2.5 sm:px-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[15px] font-semibold leading-6 tracking-tight text-brand-navy">
              {title}
            </h3>
            {unreadCount > 0 ? (
              <span
                className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-primary px-1.5 text-[10px] font-semibold text-white"
                data-testid="notifications-panel-unread-count"
              >
                {unreadCount}
              </span>
            ) : null}
          </div>
          {description ? (
            <p className="mt-0.5 text-xs text-brand-muted">{description}</p>
          ) : null}
        </div>

        {showViewAll ? (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 shrink-0 border-dash-border bg-white px-2.5 text-xs font-medium text-brand-slate shadow-none transition-colors duration-150 hover:bg-slate-50 hover:text-brand-navy"
          >
            <Link href={ROUTES.notifications}>View all</Link>
          </Button>
        ) : null}
      </div>

      {error ? (
        <div className="px-4 py-6 text-center sm:px-5">
          <p className="text-sm font-medium text-brand-navy">
            Couldn&apos;t load notifications
          </p>
          <p className="mt-1 text-xs text-brand-muted">{error}</p>
          <button
            type="button"
            className="mt-2.5 text-xs font-medium text-brand-primary transition-colors duration-150 hover:text-brand-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/25"
            onClick={() => void reload()}
          >
            Try again
          </button>
        </div>
      ) : matchedItems.length === 0 ? (
        <div
          className="px-4 py-8 text-center sm:px-5"
          data-testid="notifications-panel-empty"
        >
          <div className="mx-auto flex size-9 items-center justify-center rounded-full bg-slate-50 text-brand-muted">
            <Bell className="size-4" aria-hidden="true" />
          </div>
          <p className="mt-2.5 text-sm font-medium text-brand-navy">
            {emptyTitle}
          </p>
          <p className="mt-1 text-xs text-brand-muted">{emptyDescription}</p>
        </div>
      ) : (
        <div className="px-3 py-3 sm:px-4 sm:py-3.5">
          <InboxActivityFeed
            items={matchedItems}
            onOpen={(item) => void handleOpen(item)}
            compact={compact}
          />
        </div>
      )}
    </section>
  );
}

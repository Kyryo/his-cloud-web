"use client";

import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBanner } from "@/components/ui/status-banner";
import {
  ListPageLayout,
  ListPagePagination,
} from "@/features/app-shell/components/page-layout";
import { InboxActivityFeed } from "@/features/notifications/components/InboxActivityFeed";
import { useInboxItems } from "@/features/notifications/hooks/use-inbox-items";
import {
  markAllInboxItemsRead,
  markInboxItemRead,
} from "@/features/notifications/services/inbox.service";
import type { InboxItem } from "@/features/notifications/types/inbox.types";

const DEFAULT_PAGE_SIZE = 20;

export function NotificationsInboxPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const {
    items,
    isLoading,
    isRefreshing,
    error,
    totalCount,
    hasNext,
    hasPrevious,
    reload,
  } = useInboxItems({
    page,
    pageSize: DEFAULT_PAGE_SIZE,
  });

  useEffect(() => {
    setActionError(null);
  }, [page]);

  async function handleMarkAllRead() {
    setIsMarkingAll(true);
    setActionError(null);
    try {
      await markAllInboxItemsRead();
      await reload();
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Could not mark notifications as read.",
      );
    } finally {
      setIsMarkingAll(false);
    }
  }

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

  const hasUnread = items.some((item) => !item.is_read);
  const displayError = actionError ?? error;

  return (
    <ListPageLayout
      className="max-w-3xl"
      data-testid="notifications-inbox-page"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-brand-navy">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-brand-muted">
            Updates for claims and other work at your clinic.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 shrink-0 text-brand-slate hover:text-brand-navy"
          disabled={isLoading || isRefreshing || isMarkingAll || !hasUnread}
          onClick={() => void handleMarkAllRead()}
          data-testid="inbox-mark-all-read"
        >
          Mark all as read
        </Button>
      </div>

      <div className="pt-2">
        {isLoading ? (
          <PageLoader
            message="Loading notifications..."
            className="min-h-[16rem] py-12 lg:min-h-[16rem]"
          />
        ) : displayError ? (
          <StatusBanner
            variant="error"
            message={displayError}
            data-testid="inbox-error"
          >
            <button
              type="button"
              className="mt-2 text-sm font-medium text-red-800 underline"
              onClick={() => {
                setActionError(null);
                void reload();
              }}
            >
              Try again
            </button>
          </StatusBanner>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="You're all caught up"
            description="You don't have any new notifications right now."
            data-testid="inbox-empty-state"
            className="py-16"
          />
        ) : (
          <>
            <InboxActivityFeed
              items={items}
              onOpen={(item) => void handleOpen(item)}
            />
            <ListPagePagination
              page={page}
              pageSize={DEFAULT_PAGE_SIZE}
              totalCount={totalCount}
              hasPrevious={hasPrevious}
              hasNext={hasNext}
              onPageChange={(nextPage) => {
                setPage(nextPage);
              }}
              isLoading={isLoading || isRefreshing || isMarkingAll}
            />
          </>
        )}
      </div>
    </ListPageLayout>
  );
}

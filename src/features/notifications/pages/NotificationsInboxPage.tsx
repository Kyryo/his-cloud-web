"use client";

import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBanner } from "@/components/ui/status-banner";
import {
  ListPageLayout,
  ListPagePagination,
} from "@/features/app-shell/components/page-layout";
import { InboxActivityFeed } from "@/features/notifications/components/InboxActivityFeed";
import { INBOX_UPDATED_EVENT } from "@/features/notifications/hooks/use-inbox-unread-count";
import {
  fetchInboxItems,
  markAllInboxItemsRead,
  markInboxItemRead,
} from "@/features/notifications/services/inbox.service";
import type { InboxItem } from "@/features/notifications/types/inbox.types";

const DEFAULT_PAGE_SIZE = 20;

export function NotificationsInboxPage() {
  const router = useRouter();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const reload = useCallback(async () => {
    setError(null);
    const response = await fetchInboxItems({
      page,
      pageSize: DEFAULT_PAGE_SIZE,
    });
    setItems(response.results);
    setTotalCount(response.pagination?.count ?? response.results.length);
  }, [page]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        setError(null);
        const response = await fetchInboxItems({
          page,
          pageSize: DEFAULT_PAGE_SIZE,
        });
        if (cancelled) {
          return;
        }
        setItems(response.results);
        setTotalCount(response.pagination?.count ?? response.results.length);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load notifications.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page]);

  useEffect(() => {
    function handleInboxUpdated() {
      void reload();
    }

    function handleVisibility() {
      if (document.visibilityState === "visible") {
        handleInboxUpdated();
      }
    }

    window.addEventListener(INBOX_UPDATED_EVENT, handleInboxUpdated);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener(INBOX_UPDATED_EVENT, handleInboxUpdated);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [reload]);

  async function handleMarkAllRead() {
    setIsRefreshing(true);
    try {
      await markAllInboxItemsRead();
      await reload();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not mark notifications as read.",
      );
    } finally {
      setIsRefreshing(false);
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
  const totalPages = Math.max(1, Math.ceil(totalCount / DEFAULT_PAGE_SIZE));

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
          disabled={isLoading || isRefreshing || !hasUnread}
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
        ) : error ? (
          <StatusBanner
            variant="error"
            message={error}
            data-testid="inbox-error"
          >
            <button
              type="button"
              className="mt-2 text-sm font-medium text-red-800 underline"
              onClick={() => {
                setIsRefreshing(true);
                void reload().finally(() => setIsRefreshing(false));
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
          <InboxActivityFeed items={items} onOpen={(item) => void handleOpen(item)} />
        )}
        {totalPages > 1 && items.length > 0 ? (
          <ListPagePagination
            page={page}
            pageSize={DEFAULT_PAGE_SIZE}
            totalCount={totalCount}
            hasPrevious={page > 1}
            hasNext={page < totalPages}
            onPageChange={setPage}
            isLoading={isLoading || isRefreshing}
          />
        ) : null}
      </div>
    </ListPageLayout>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { INBOX_UPDATED_EVENT } from "@/features/notifications/hooks/use-inbox-unread-count";
import { fetchInboxItems } from "@/features/notifications/services/inbox.service";
import type { InboxItem } from "@/features/notifications/types/inbox.types";

type UseInboxItemsOptions = {
  enabled?: boolean;
  page?: number;
  pageSize?: number;
};

type UseInboxItemsResult = {
  items: InboxItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
  reload: () => Promise<void>;
};

export function useInboxItems({
  enabled = true,
  page = 1,
  pageSize = 20,
}: UseInboxItemsOptions = {}): UseInboxItemsResult {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const hasLoadedRef = useRef(false);

  const reload = useCallback(async () => {
    if (!enabled) {
      return;
    }

    setError(null);
    const response = await fetchInboxItems({ page, pageSize });
    setItems(response.results);
    setTotalCount(response.pagination?.count ?? response.results.length);
    setHasNext(Boolean(response.pagination?.next));
    setHasPrevious(Boolean(response.pagination?.previous));
    hasLoadedRef.current = true;
  }, [enabled, page, pageSize]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return undefined;
    }

    let cancelled = false;
    if (!hasLoadedRef.current) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    void (async () => {
      try {
        setError(null);
        const response = await fetchInboxItems({ page, pageSize });
        if (cancelled) {
          return;
        }
        setItems(response.results);
        setTotalCount(response.pagination?.count ?? response.results.length);
        setHasNext(Boolean(response.pagination?.next));
        setHasPrevious(Boolean(response.pagination?.previous));
        hasLoadedRef.current = true;
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
  }, [enabled, page, pageSize]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    function handleInboxUpdated() {
      setIsRefreshing(true);
      void reload().finally(() => setIsRefreshing(false));
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
  }, [enabled, reload]);

  return {
    items,
    isLoading,
    isRefreshing,
    error,
    totalCount,
    hasNext,
    hasPrevious,
    reload,
  };
}

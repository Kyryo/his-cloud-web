"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { BFF_NOTIFICATIONS_ROUTES } from "@/constants/api";
import { ROUTES } from "@/constants/routes";
import { fetchInboxUnreadCount } from "@/features/notifications/services/inbox.service";
import type {
  InboxItem,
  InboxUnreadCountResponse,
} from "@/features/notifications/types/inbox.types";
import { useToast } from "@/providers/toast-provider";

export const INBOX_UPDATED_EVENT = "hmis-inbox-updated";

export function inboxNotifyKey(
  count: number,
  latest: InboxItem | null,
): string {
  if (!latest) {
    return `count:${count}`;
  }
  return `${latest.id}:${latest.item_count}:${latest.occurred_at}`;
}

export function useInboxUnreadCount(
  enabled = true,
  options: { notifyOnNew?: boolean } = {},
) {
  const { notifyOnNew = false } = options;
  const { toast } = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const [count, setCount] = useState(0);
  const seenKeyRef = useRef<string | null>(null);
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let cancelled = false;

    async function refresh(fromPush = false) {
      try {
        const response = await fetchInboxUnreadCount();
        if (cancelled) {
          return;
        }
        applySnapshot(response, fromPush);
      } catch {
        // Keep the last known count on transient errors.
      }
    }

    function applySnapshot(
      response: InboxUnreadCountResponse,
      fromPush: boolean,
    ) {
      setCount(response.count);
      const nextKey = inboxNotifyKey(response.count, response.latest ?? null);
      const previousKey = seenKeyRef.current;
      seenKeyRef.current = nextKey;
      if (fromPush) {
        window.dispatchEvent(new CustomEvent(INBOX_UPDATED_EVENT));
      }
      const latest = response.latest;
      if (
        !notifyOnNew ||
        !fromPush ||
        previousKey === null ||
        previousKey === nextKey ||
        !latest ||
        pathnameRef.current === ROUTES.notifications
      ) {
        return;
      }
      toast({
        variant: "info",
        id: `inbox-${nextKey}`,
        title: latest.title,
        description: latest.body,
        action: {
          label: "View",
          onClick: () => {
            router.push(latest.href || ROUTES.notifications);
          },
        },
      });
    }

    void refresh(false);

    let source: EventSource | null = null;
    if (typeof EventSource !== "undefined") {
      source = new EventSource(BFF_NOTIFICATIONS_ROUTES.events);
      source.addEventListener("inbox", () => {
        void refresh(true);
      });
    }

    function handleVisibility() {
      if (document.visibilityState === "visible") {
        void refresh(false);
      }
    }

    function handleFocus() {
      void refresh(false);
    }

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);

    return () => {
      cancelled = true;
      source?.close();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
    };
  }, [enabled, notifyOnNew, router, toast]);

  return count;
}

import { BFF_NOTIFICATIONS_ROUTES } from "@/constants/api";
import type {
  InboxItem,
  InboxListResponse,
  InboxUnreadCountResponse,
} from "@/features/notifications/types/inbox.types";
import { bffRequest } from "@/lib/bff-client";

function buildInboxQuery(page?: number, pageSize?: number): string {
  const params = new URLSearchParams();
  if (page) {
    params.set("page", String(page));
  }
  if (pageSize) {
    params.set("page_size", String(pageSize));
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchInboxItems(options: {
  page?: number;
  pageSize?: number;
} = {}): Promise<InboxListResponse> {
  return bffRequest<InboxListResponse>(
    `${BFF_NOTIFICATIONS_ROUTES.inbox}${buildInboxQuery(options.page, options.pageSize)}`,
  );
}

export async function fetchInboxUnreadCount(): Promise<InboxUnreadCountResponse> {
  return bffRequest<InboxUnreadCountResponse>(
    BFF_NOTIFICATIONS_ROUTES.unreadCount,
  );
}

export async function markInboxItemRead(id: number): Promise<InboxItem> {
  return bffRequest<InboxItem>(BFF_NOTIFICATIONS_ROUTES.read(id), {
    method: "POST",
  });
}

export async function markAllInboxItemsRead(): Promise<{ updated: number }> {
  return bffRequest<{ updated: number }>(BFF_NOTIFICATIONS_ROUTES.readAll, {
    method: "POST",
  });
}

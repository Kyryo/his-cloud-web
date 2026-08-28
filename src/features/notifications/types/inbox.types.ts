export type InboxModule = "claims" | string;

export type InboxEventType =
  | "ready_for_submission"
  | "needs_attention"
  | "submitted"
  | "requires_manual_submission"
  | string;

export type InboxItem = {
  id: number;
  uuid: string;
  module: InboxModule;
  event_type: InboxEventType;
  title: string;
  body: string;
  preview_name: string;
  item_count: number;
  object_id: string;
  clinic_id: number | null;
  is_read: boolean;
  read_at: string | null;
  occurred_at: string;
  href: string;
  payload: Record<string, unknown>;
};

export type InboxListResponse = {
  results: InboxItem[];
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
  } | null;
};

export type InboxUnreadCountResponse = {
  count: number;
  latest: InboxItem | null;
};

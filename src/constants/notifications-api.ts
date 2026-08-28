/** Django DRF v1 notification inbox endpoints (relative to HMIS_API_URL). */
export const NOTIFICATIONS_API_PATHS = {
  inbox: "/notifications/inbox/",
  unreadCount: "/notifications/inbox/unread-count/",
  events: "/notifications/inbox/events/",
  readAll: "/notifications/inbox/read-all/",
  read: (id: number | string) => `/notifications/inbox/${id}/read/`,
} as const;

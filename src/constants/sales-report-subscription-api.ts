/** Django DRF v1 sales report subscription endpoints (relative to HMIS_API_URL, server-only). */
export const SALES_REPORT_SUBSCRIPTION_API_PATHS = {
  me: "/sales-report-subscriptions/me/",
  unsubscribe: "/sales-report-subscriptions/unsubscribe/",
  user: (userId: number | string) =>
    `/sales-report-subscriptions/users/${userId}/`,
  block: (userId: number | string) =>
    `/sales-report-subscriptions/users/${userId}/block/`,
  unblock: (userId: number | string) =>
    `/sales-report-subscriptions/users/${userId}/unblock/`,
} as const;

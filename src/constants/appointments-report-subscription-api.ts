/** Django DRF v1 appointments report subscription endpoints. */
export const APPOINTMENTS_REPORT_SUBSCRIPTION_API_PATHS = {
  me: "/appointments-report-subscriptions/me/",
  unsubscribe: "/appointments-report-subscriptions/unsubscribe/",
  user: (userId: number | string) =>
    `/appointments-report-subscriptions/users/${userId}/`,
  block: (userId: number | string) =>
    `/appointments-report-subscriptions/users/${userId}/block/`,
  unblock: (userId: number | string) =>
    `/appointments-report-subscriptions/users/${userId}/unblock/`,
} as const;

import type {
  AdminUpdateSalesReportSubscriptionPayload,
  SalesReportSubscription,
  UnsubscribeSalesReportsPayload,
  UnsubscribeSalesReportsResponse,
  UpdateSalesReportSubscriptionPayload,
} from "@/features/notifications/types/sales-report-subscription.types";
import { bffRequest } from "@/lib/bff-client";

const SUBSCRIPTION_ROUTE = "/api/account/sales-report-subscription";
const UNSUBSCRIBE_ROUTE = "/api/public/sales-reports/unsubscribe";

function userSubscriptionRoute(userId: number) {
  return `/api/user-management/${userId}/sales-report-subscription`;
}

function userBlockRoute(userId: number) {
  return `/api/user-management/${userId}/sales-report-subscription/block`;
}

function userUnblockRoute(userId: number) {
  return `/api/user-management/${userId}/sales-report-subscription/unblock`;
}

export async function fetchSalesReportSubscription(): Promise<SalesReportSubscription> {
  const data = await bffRequest<{ subscription: SalesReportSubscription }>(
    SUBSCRIPTION_ROUTE,
  );
  return data.subscription;
}

export async function updateSalesReportSubscription(
  payload: UpdateSalesReportSubscriptionPayload,
): Promise<SalesReportSubscription> {
  const data = await bffRequest<{ subscription: SalesReportSubscription }>(
    SUBSCRIPTION_ROUTE,
    { method: "PATCH", body: payload },
  );
  return data.subscription;
}

export async function fetchUserSalesReportSubscription(
  userId: number,
): Promise<SalesReportSubscription> {
  const data = await bffRequest<{ subscription: SalesReportSubscription }>(
    userSubscriptionRoute(userId),
  );
  return data.subscription;
}

export async function updateUserSalesReportSubscription(
  userId: number,
  payload: AdminUpdateSalesReportSubscriptionPayload,
): Promise<SalesReportSubscription> {
  const data = await bffRequest<{ subscription: SalesReportSubscription }>(
    userSubscriptionRoute(userId),
    { method: "PATCH", body: payload },
  );
  return data.subscription;
}

export async function blockUserSalesReports(
  userId: number,
): Promise<SalesReportSubscription> {
  const data = await bffRequest<{ subscription: SalesReportSubscription }>(
    userBlockRoute(userId),
    { method: "POST" },
  );
  return data.subscription;
}

export async function unblockUserSalesReports(
  userId: number,
): Promise<SalesReportSubscription> {
  const data = await bffRequest<{ subscription: SalesReportSubscription }>(
    userUnblockRoute(userId),
    { method: "POST" },
  );
  return data.subscription;
}

export async function unsubscribeFromSalesReports(
  payload: UnsubscribeSalesReportsPayload,
): Promise<UnsubscribeSalesReportsResponse> {
  return bffRequest<UnsubscribeSalesReportsResponse>(UNSUBSCRIBE_ROUTE, {
    method: "POST",
    body: payload,
  });
}

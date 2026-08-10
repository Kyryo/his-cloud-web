import type {
  AppointmentsReportSubscription,
  UnsubscribeAppointmentsReportsPayload,
  UnsubscribeAppointmentsReportsResponse,
  UpdateAppointmentsReportSubscriptionPayload,
} from "@/features/notifications/types/appointments-report-subscription.types";
import { bffRequest } from "@/lib/bff-client";

const SUBSCRIPTION_ROUTE = "/api/account/appointments-report-subscription";
const UNSUBSCRIBE_ROUTE = "/api/public/appointments-reports/unsubscribe";

export async function fetchAppointmentsReportSubscription(): Promise<AppointmentsReportSubscription> {
  const data = await bffRequest<{ subscription: AppointmentsReportSubscription }>(
    SUBSCRIPTION_ROUTE,
  );
  return data.subscription;
}

export async function updateAppointmentsReportSubscription(
  payload: UpdateAppointmentsReportSubscriptionPayload,
): Promise<AppointmentsReportSubscription> {
  const data = await bffRequest<{ subscription: AppointmentsReportSubscription }>(
    SUBSCRIPTION_ROUTE,
    { method: "PATCH", body: payload },
  );
  return data.subscription;
}

export async function unsubscribeFromAppointmentsReports(
  payload: UnsubscribeAppointmentsReportsPayload,
): Promise<UnsubscribeAppointmentsReportsResponse> {
  return bffRequest<UnsubscribeAppointmentsReportsResponse>(UNSUBSCRIBE_ROUTE, {
    method: "POST",
    body: payload,
  });
}

import { APPOINTMENTS_REPORT_SUBSCRIPTION_API_PATHS } from "@/constants/appointments-report-subscription-api";
import { updateAppointmentsReportSubscriptionBodySchema } from "@/features/notifications/schemas/appointments-report-subscription.schema";
import type { AppointmentsReportSubscription } from "@/features/notifications/types/appointments-report-subscription.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { parseJsonBody } from "@/lib/server/parse-json-body";
import { requireAccessToken } from "@/lib/server/require-access-token";

export async function GET() {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const data = await hmisApiRequest<{
      subscription: AppointmentsReportSubscription;
    }>(APPOINTMENTS_REPORT_SUBSCRIPTION_API_PATHS.me, {
      token: auth.accessToken,
    });

    return bffSuccess({ subscription: data.subscription });
  } catch (error) {
    return bffError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const parsed = await parseJsonBody(
      request,
      updateAppointmentsReportSubscriptionBodySchema,
    );
    if ("error" in parsed) {
      return parsed.error;
    }

    const data = await hmisApiRequest<{
      subscription: AppointmentsReportSubscription;
    }>(APPOINTMENTS_REPORT_SUBSCRIPTION_API_PATHS.me, {
      method: "PATCH",
      token: auth.accessToken,
      body: parsed.data,
    });

    return bffSuccess({ subscription: data.subscription });
  } catch (error) {
    return bffError(error);
  }
}

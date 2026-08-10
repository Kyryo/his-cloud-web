import { APPOINTMENTS_REPORT_SUBSCRIPTION_API_PATHS } from "@/constants/appointments-report-subscription-api";
import { unsubscribeAppointmentsReportsBodySchema } from "@/features/notifications/schemas/appointments-report-subscription.schema";
import type { UnsubscribeAppointmentsReportsResponse } from "@/features/notifications/types/appointments-report-subscription.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { parseJsonBody } from "@/lib/server/parse-json-body";

export async function POST(request: Request) {
  try {
    const parsed = await parseJsonBody(
      request,
      unsubscribeAppointmentsReportsBodySchema,
    );
    if ("error" in parsed) {
      return parsed.error;
    }

    const data = await hmisApiRequest<UnsubscribeAppointmentsReportsResponse>(
      APPOINTMENTS_REPORT_SUBSCRIPTION_API_PATHS.unsubscribe,
      {
        method: "POST",
        body: parsed.data,
      },
    );

    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}

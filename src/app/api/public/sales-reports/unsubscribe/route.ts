import { SALES_REPORT_SUBSCRIPTION_API_PATHS } from "@/constants/sales-report-subscription-api";
import { unsubscribeSalesReportsBodySchema } from "@/features/notifications/schemas/sales-report-subscription.schema";
import type { UnsubscribeSalesReportsResponse } from "@/features/notifications/types/sales-report-subscription.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { parseJsonBody } from "@/lib/server/parse-json-body";

export async function POST(request: Request) {
  try {
    const parsed = await parseJsonBody(request, unsubscribeSalesReportsBodySchema);
    if ("error" in parsed) {
      return parsed.error;
    }

    const data = await hmisApiRequest<UnsubscribeSalesReportsResponse>(
      SALES_REPORT_SUBSCRIPTION_API_PATHS.unsubscribe,
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

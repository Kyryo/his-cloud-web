import { INVOICES_API_PATHS } from "@/constants/invoices-api";
import type { BillingActivityListResponse } from "@/features/billing/types/billing-activity.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ invoiceId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { invoiceId } = await context.params;
    const data = await hmisApiRequest<BillingActivityListResponse>(
      `${INVOICES_API_PATHS.detail(invoiceId)}activity/`,
      { token: auth.accessToken },
    );

    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}

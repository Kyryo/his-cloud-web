import { CLAIMS_API_PATHS } from "@/constants/claims-api";
import type { ClaimDetail } from "@/features/claims/types/claims.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { HmisApiError, hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ claimId: string; lineItemId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { claimId, lineItemId } = await context.params;

  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const body = await request.json();
    const claim = await hmisApiRequest<ClaimDetail>(
      CLAIMS_API_PATHS.lineItemPaymentSplit(claimId, lineItemId),
      {
        method: "PATCH",
        token: auth.accessToken,
        body,
      },
    );

    return bffSuccess(claim);
  } catch (error) {
    if (error instanceof HmisApiError) {
      console.error("[claims/line-items/payment-split] HMIS API error", {
        claimId,
        lineItemId,
        status: error.status,
        message: error.message,
        errors: error.errors,
      });
    } else {
      console.error("[claims/line-items/payment-split] Unexpected error", {
        claimId,
        lineItemId,
        error,
      });
    }
    return bffError(error);
  }
}

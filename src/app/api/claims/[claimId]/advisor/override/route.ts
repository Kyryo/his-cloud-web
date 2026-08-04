import { CLAIMS_API_PATHS } from "@/constants/claims-api";
import type { ClaimAdvisoryOverride } from "@/features/claims/types/claims.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { HmisApiError, hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ claimId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { claimId } = await context.params;

  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const body = (await request.json()) as { note?: string };
    const override = await hmisApiRequest<ClaimAdvisoryOverride>(
      CLAIMS_API_PATHS.advisorOverride(claimId),
      {
        method: "POST",
        token: auth.accessToken,
        body,
      },
    );

    return bffSuccess(override, 201);
  } catch (error) {
    if (error instanceof HmisApiError) {
      console.error("[claims/advisor/override] HMIS API error", {
        claimId,
        status: error.status,
        message: error.message,
      });
    }
    return bffError(error);
  }
}

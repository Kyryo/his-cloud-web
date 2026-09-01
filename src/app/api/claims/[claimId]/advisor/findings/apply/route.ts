import { CLAIMS_API_PATHS } from "@/constants/claims-api";
import type { ClaimDetail } from "@/features/claims/types/claims.types";
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

    const body = (await request.json()) as Record<string, unknown>;
    const claim = await hmisApiRequest<ClaimDetail>(
      CLAIMS_API_PATHS.advisorFindingsApply(claimId),
      {
        method: "POST",
        token: auth.accessToken,
        body,
      },
    );

    return bffSuccess(claim);
  } catch (error) {
    if (error instanceof HmisApiError) {
      console.error("[claims/advisor/findings/apply] HMIS API error", {
        claimId,
        status: error.status,
        message: error.message,
      });
    }
    return bffError(error);
  }
}

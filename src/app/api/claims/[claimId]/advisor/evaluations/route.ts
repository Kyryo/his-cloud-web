import { CLAIMS_API_PATHS } from "@/constants/claims-api";
import type { AdvisorEvaluation } from "@/features/claims/types/claims.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { HmisApiError, hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ claimId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { claimId } = await context.params;

  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const evaluations = await hmisApiRequest<AdvisorEvaluation[]>(
      CLAIMS_API_PATHS.advisorEvaluations(claimId),
      {
        method: "GET",
        token: auth.accessToken,
      },
    );

    return bffSuccess(evaluations);
  } catch (error) {
    if (error instanceof HmisApiError) {
      console.error("[claims/advisor/evaluations] HMIS API error", {
        claimId,
        status: error.status,
        message: error.message,
      });
    }
    return bffError(error);
  }
}

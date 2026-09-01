import { CLAIMS_API_PATHS } from "@/constants/claims-api";
import type { ClaimAdvisoryStatusSnapshot } from "@/features/claims/types/claims.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ claimId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { claimId } = await context.params;
    const status = await hmisApiRequest<ClaimAdvisoryStatusSnapshot>(
      CLAIMS_API_PATHS.advisorStatus(claimId),
      {
        token: auth.accessToken,
      },
    );

    return bffSuccess(status);
  } catch (error) {
    return bffError(error);
  }
}

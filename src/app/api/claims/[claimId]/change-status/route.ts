import { CLAIMS_API_PATHS } from "@/constants/claims-api";
import type { ClaimDetail } from "@/features/claims/types/claims.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ claimId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }
    const { claimId } = await context.params;
    const body = await request.json();
    const data = await hmisApiRequest<ClaimDetail>(
      CLAIMS_API_PATHS.changeStatus(claimId),
      {
        token: auth.accessToken,
        method: "POST",
        body,
      },
    );
    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}

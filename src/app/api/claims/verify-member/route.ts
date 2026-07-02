import { CLAIMS_API_PATHS } from "@/constants/claims-api";
import type { VerifyMemberResponse } from "@/features/claims/types/claims.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

export async function POST(request: Request) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const body = await request.json();

    const result = await hmisApiRequest<VerifyMemberResponse>(
      CLAIMS_API_PATHS.verifyMember,
      {
        method: "POST",
        token: auth.accessToken,
        body,
      },
    );

    return bffSuccess(result);
  } catch (error) {
    return bffError(error);
  }
}

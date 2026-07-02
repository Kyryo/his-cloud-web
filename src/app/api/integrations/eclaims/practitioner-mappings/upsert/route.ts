import { CLAIMS_API_PATHS } from "@/constants/claims-api";
import type { EClaimPractitionerMapping } from "@/features/claims/types/claims.types";
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
    const mapping = await hmisApiRequest<EClaimPractitionerMapping>(
      CLAIMS_API_PATHS.practitionerMappingsUpsert,
      {
        method: "POST",
        token: auth.accessToken,
        body,
      },
    );

    return bffSuccess({ mapping });
  } catch (error) {
    return bffError(error);
  }
}

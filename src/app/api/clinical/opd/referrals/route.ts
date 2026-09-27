import { CLINICAL_OPD_API_PATHS } from "@/constants/clinical-opd-api";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

export async function GET(request: Request) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }
    const url = new URL(request.url);
    const query = url.searchParams.toString();
    const path = `${CLINICAL_OPD_API_PATHS.clinicalReferrals}${query ? `?${query}` : ""}`;
    const results = await hmisApiRequest<unknown[]>(path, {
      token: auth.accessToken,
    });
    return bffSuccess({ results });
  } catch (error) {
    return bffError(error);
  }
}

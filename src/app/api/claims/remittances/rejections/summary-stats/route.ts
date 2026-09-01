import { CLAIMS_API_PATHS } from "@/constants/claims-api";
import type { RemittanceRejectionSummaryStats } from "@/features/claims/types/remittances.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

export async function GET(request: Request) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const incoming = new URL(request.url).searchParams;
    const params = new URLSearchParams();
    for (const key of ["payer_code", "search"] as const) {
      const value = incoming.get(key);
      if (value) {
        params.set(key, value);
      }
    }
    const query = params.toString();
    const data = await hmisApiRequest<RemittanceRejectionSummaryStats>(
      `${CLAIMS_API_PATHS.remittanceRejectionsSummaryStats}${query ? `?${query}` : ""}`,
      { token: auth.accessToken },
    );

    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}

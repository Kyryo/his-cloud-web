import { CLINICAL_OPD_API_PATHS } from "@/constants/clinical-opd-api";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";
import { buildForwardedQuery } from "@/lib/server/inventory-bff-handlers";

const QUEUE_QUERY_KEYS = ["status", "clinic_uuid", "limit"] as const;

export async function GET(request: Request) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const query = buildForwardedQuery(request, QUEUE_QUERY_KEYS, { limit: "50" });
    const results = await hmisApiRequest<unknown[]>(
      `${CLINICAL_OPD_API_PATHS.queue}${query}`,
      { token: auth.accessToken },
    );
    return bffSuccess({ results, pagination: null });
  } catch (error) {
    return bffError(error);
  }
}

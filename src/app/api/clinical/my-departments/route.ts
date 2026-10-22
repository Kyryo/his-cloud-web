import { CLINICAL_WORKSPACE_API_PATHS } from "@/constants/clinical-workspace-api";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { buildForwardedQuery } from "@/lib/server/inventory-bff-handlers";
import { requireAccessToken } from "@/lib/server/require-access-token";

const QUERY_KEYS = ["specialty"] as const;

export async function GET(request: Request) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const query = buildForwardedQuery(request, QUERY_KEYS);
    const results = await hmisApiRequest<unknown[]>(
      `${CLINICAL_WORKSPACE_API_PATHS.memberDepartments}${query}`,
      { token: auth.accessToken },
    );
    return bffSuccess({ results, pagination: null });
  } catch (error) {
    return bffError(error);
  }
}

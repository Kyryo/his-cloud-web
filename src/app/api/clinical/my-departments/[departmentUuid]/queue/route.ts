import { CLINICAL_WORKSPACE_API_PATHS } from "@/constants/clinical-workspace-api";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { buildForwardedQuery } from "@/lib/server/inventory-bff-handlers";
import { requireAccessToken } from "@/lib/server/require-access-token";

const QUEUE_QUERY_KEYS = [
  "queue_stage",
  "status",
  "clinic_uuid",
  "search",
  "limit",
] as const;

type RouteContext = {
  params: Promise<{ departmentUuid: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { departmentUuid } = await context.params;
    const query = buildForwardedQuery(request, QUEUE_QUERY_KEYS, { limit: "50" });
    const results = await hmisApiRequest<unknown[]>(
      `${CLINICAL_WORKSPACE_API_PATHS.departmentQueue(departmentUuid)}${query}`,
      { token: auth.accessToken },
    );
    return bffSuccess({ results, pagination: null });
  } catch (error) {
    return bffError(error);
  }
}

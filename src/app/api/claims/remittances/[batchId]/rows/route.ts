import { CLAIMS_API_PATHS } from "@/constants/claims-api";
import type { RemittanceRowListResponse } from "@/features/claims/types/remittances.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequestWithMeta } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ batchId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { batchId } = await context.params;
    const incoming = new URL(request.url).searchParams;
    const params = new URLSearchParams();
    for (const key of ["page", "page_size", "search"] as const) {
      const value = incoming.get(key);
      if (value) {
        params.set(key, value);
      }
    }
    const query = params.toString();
    const { data, meta } = await hmisApiRequestWithMeta(
      `${CLAIMS_API_PATHS.remittanceRows(batchId)}${query ? `?${query}` : ""}`,
      { token: auth.accessToken },
    );

    return bffSuccess({
      results: data,
      pagination: meta.pagination ?? null,
    } satisfies RemittanceRowListResponse);
  } catch (error) {
    return bffError(error);
  }
}

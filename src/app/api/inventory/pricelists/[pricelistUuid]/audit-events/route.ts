import { PRICELISTS_API_PATHS } from "@/constants/pricelists-api";
import type { CatalogAuditEvent } from "@/features/catalog/types/catalog.types";
import { buildForwardedQuery } from "@/lib/server/inventory-bff-handlers";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequestWithMeta } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = { params: Promise<{ pricelistUuid: string }> };

const QUERY_KEYS = ["page", "page_size"] as const;

export async function GET(request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }
    const { pricelistUuid } = await context.params;
    const query = buildForwardedQuery(request, QUERY_KEYS);
    const { data, meta } = await hmisApiRequestWithMeta<CatalogAuditEvent[]>(
      `${PRICELISTS_API_PATHS.auditEvents(pricelistUuid)}${query}`,
      { token: auth.accessToken },
    );
    return bffSuccess({
      results: data,
      pagination: meta.pagination ?? null,
    });
  } catch (error) {
    return bffError(error);
  }
}

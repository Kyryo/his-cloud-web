import { LOCATIONS_API_PATHS } from "@/constants/locations-api";
import type { InventoryLocationOption } from "@/features/inventory/types/inventory.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { buildForwardedQuery } from "@/lib/server/inventory-bff-handlers";
import { hmisApiRequestWithMeta } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

const QUERY_KEYS = ["page", "page_size", "search", "ordering", "clinic"] as const;

export async function GET(request: Request) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const query = buildForwardedQuery(request, QUERY_KEYS, {
      page_size: "200",
    });
    const { data, meta } = await hmisApiRequestWithMeta<InventoryLocationOption[]>(
      `${LOCATIONS_API_PATHS.list}${query}`,
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

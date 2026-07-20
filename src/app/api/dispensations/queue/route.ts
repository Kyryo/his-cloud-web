import { INVENTORY_API_PATHS } from "@/constants/inventory-api";
import type { DispensationQueueItem } from "@/features/dispensation/types/dispensation.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequestWithMeta } from "@/lib/server/hmis-api";
import {
  buildForwardedQuery,
} from "@/lib/server/inventory-bff-handlers";
import { requireAccessToken } from "@/lib/server/require-access-token";

const QUERY_KEYS = ["page", "page_size", "search"] as const;

export async function GET(request: Request) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const query = buildForwardedQuery(request, QUERY_KEYS);
    const { data, meta } = await hmisApiRequestWithMeta<DispensationQueueItem[]>(
      `${INVENTORY_API_PATHS.dispensations.queue.list}${query}`,
      { token: auth.accessToken },
    );
    const params = new URL(request.url).searchParams;
    const page = Number(params.get("page") || 1);
    const pageSize = Number(params.get("page_size") || 20);

    return bffSuccess({
      results: data,
      page,
      page_size: pageSize,
      count: meta.pagination?.count ?? null,
    });
  } catch (error) {
    return bffError(error);
  }
}

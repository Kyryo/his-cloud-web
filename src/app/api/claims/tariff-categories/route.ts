import { CLAIMS_API_PATHS } from "@/constants/claims-api";
import type { TariffCategory } from "@/features/claims/types/claims.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { HmisApiError, hmisApiRequestWithMeta } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

const FORWARDED_QUERY_KEYS = ["page", "page_size", "search"] as const;

function buildUpstreamQuery(request: Request): string {
  const incoming = new URL(request.url).searchParams;
  const params = new URLSearchParams();

  for (const key of FORWARDED_QUERY_KEYS) {
    const value = incoming.get(key);
    if (value) {
      params.set(key, value);
    }
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function GET(request: Request) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const query = buildUpstreamQuery(request);
    const { data, meta } = await hmisApiRequestWithMeta<TariffCategory[]>(
      `${CLAIMS_API_PATHS.tariffCategories}${query}`,
      {
        method: "GET",
        token: auth.accessToken,
      },
    );

    return bffSuccess({
      results: data,
      pagination: meta.pagination ?? null,
    });
  } catch (error) {
    if (error instanceof HmisApiError) {
      console.error("[claims/tariff-categories] HMIS API error", {
        status: error.status,
        message: error.message,
      });
    }
    return bffError(error);
  }
}

import { CLAIMS_API_PATHS } from "@/constants/claims-api";
import type { RemittanceBatchListResponse } from "@/features/claims/types/remittances.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest, hmisApiRequestWithMeta } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

export async function GET(request: Request) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const incoming = new URL(request.url).searchParams;
    const params = new URLSearchParams();
    for (const key of ["page", "page_size", "status"] as const) {
      const value = incoming.get(key);
      if (value) {
        params.set(key, value);
      }
    }
    const query = params.toString();
    const { data, meta } = await hmisApiRequestWithMeta(
      `${CLAIMS_API_PATHS.remittances}${query ? `?${query}` : ""}`,
      { token: auth.accessToken },
    );

    return bffSuccess({
      results: data,
      pagination: meta.pagination ?? null,
    } satisfies RemittanceBatchListResponse);
  } catch (error) {
    return bffError(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const formData = await request.formData();
    const data = await hmisApiRequest(CLAIMS_API_PATHS.remittances, {
      token: auth.accessToken,
      method: "POST",
      body: formData,
    });
    return bffSuccess(data, 202);
  } catch (error) {
    return bffError(error);
  }
}

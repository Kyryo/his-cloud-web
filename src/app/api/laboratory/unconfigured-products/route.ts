import { LABORATORY_API_PATHS } from "@/constants/laboratory-api";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequestWithMeta } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

export async function GET(request: Request) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const incoming = new URL(request.url).searchParams;
    const params = new URLSearchParams();
    for (const key of ["page", "page_size"] as const) {
      const value = incoming.get(key);
      if (value) params.set(key, value);
    }
    const query = params.toString();
    const path = `${LABORATORY_API_PATHS.unconfiguredProducts}${
      query ? `?${query}` : ""
    }`;

    const { data, meta } = await hmisApiRequestWithMeta<unknown[]>(path, {
      token: auth.accessToken,
    });

    return bffSuccess({
      results: data,
      pagination: meta.pagination ?? null,
    });
  } catch (error) {
    return bffError(error);
  }
}

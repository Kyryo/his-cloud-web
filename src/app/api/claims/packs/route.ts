import { CLAIMS_API_PATHS } from "@/constants/claims-api";
import type { ValidationPack } from "@/features/claims/types/claims.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { HmisApiError, hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

export async function GET(request: Request) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const incoming = new URL(request.url).searchParams;
    const params = new URLSearchParams();
    const assignable = incoming.get("assignable");
    if (assignable) {
      params.set("assignable", assignable);
    }
    const query = params.toString();
    const packs = await hmisApiRequest<ValidationPack[]>(
      `${CLAIMS_API_PATHS.validationPacks}${query ? `?${query}` : ""}`,
      {
        method: "GET",
        token: auth.accessToken,
      },
    );

    return bffSuccess({
      results: Array.isArray(packs) ? packs : [],
    });
  } catch (error) {
    if (error instanceof HmisApiError) {
      console.error("[claims/packs] HMIS API error", {
        status: error.status,
        message: error.message,
      });
    }
    return bffError(error);
  }
}

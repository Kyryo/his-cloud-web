import { CLAIMS_API_PATHS } from "@/constants/claims-api";
import type { PricelistValidationConfig } from "@/features/claims/types/claims.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { HmisApiError, hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ pricelistUuid: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { pricelistUuid } = await context.params;
    const config = await hmisApiRequest<PricelistValidationConfig>(
      CLAIMS_API_PATHS.pricelistConfig(pricelistUuid),
      {
        method: "GET",
        token: auth.accessToken,
      },
    );

    return bffSuccess(config);
  } catch (error) {
    if (error instanceof HmisApiError) {
      console.error("[claims/pricelist-configs] HMIS API error", {
        status: error.status,
        message: error.message,
      });
    }
    return bffError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { pricelistUuid } = await context.params;
    const body = await request.json();
    const config = await hmisApiRequest<PricelistValidationConfig>(
      CLAIMS_API_PATHS.pricelistConfig(pricelistUuid),
      {
        method: "PUT",
        token: auth.accessToken,
        body,
      },
    );

    return bffSuccess(config);
  } catch (error) {
    if (error instanceof HmisApiError) {
      console.error("[claims/pricelist-configs] HMIS API error", {
        status: error.status,
        message: error.message,
      });
    }
    return bffError(error);
  }
}

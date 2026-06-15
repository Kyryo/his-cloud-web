import { CONSULTATION_SERVICES_API_PATHS } from "@/constants/consultation-services-api";
import type { ConsultationServiceCatalogItem } from "@/features/visits/types/visit.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequestWithMeta } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

export async function GET() {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { data: services } = await hmisApiRequestWithMeta<
      ConsultationServiceCatalogItem[]
    >(`${CONSULTATION_SERVICES_API_PATHS.list}?is_active=true&page_size=100`, {
      token: auth.accessToken,
    });

    return bffSuccess({ results: services });
  } catch (error) {
    return bffError(error);
  }
}

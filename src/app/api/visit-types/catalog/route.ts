import { VISIT_TYPES_API_PATHS } from "@/constants/visit-types-api";
import type { VisitTypeCatalogItem } from "@/features/customers/types/customer-visit.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequestWithMeta } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

export async function GET() {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { data: visitTypes } = await hmisApiRequestWithMeta<VisitTypeCatalogItem[]>(
      `${VISIT_TYPES_API_PATHS.list}?is_active=true&page_size=100`,
      { token: auth.accessToken },
    );

    return bffSuccess({ results: visitTypes });
  } catch (error) {
    return bffError(error);
  }
}

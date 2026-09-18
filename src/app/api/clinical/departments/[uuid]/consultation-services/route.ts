import { DEPARTMENTS_API_PATHS } from "@/constants/departments-api";
import type { ConsultationServiceCatalogItem } from "@/features/visits/types/visit.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequestWithMeta } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

function asServiceList(data: unknown): ConsultationServiceCatalogItem[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "results" in data &&
    Array.isArray((data as { results: unknown }).results)
  ) {
    return (data as { results: ConsultationServiceCatalogItem[] }).results;
  }

  return [];
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { uuid } = await context.params;
    const { data } = await hmisApiRequestWithMeta<unknown>(
      DEPARTMENTS_API_PATHS.consultationServices(uuid),
      { token: auth.accessToken },
    );

    return bffSuccess({ results: asServiceList(data) });
  } catch (error) {
    return bffError(error);
  }
}

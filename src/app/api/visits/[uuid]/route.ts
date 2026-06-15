import { VISITS_API_PATHS } from "@/constants/visits-api";
import type { VisitDetail } from "@/features/visits/types/visit.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { uuid } = await context.params;
    const visit = await hmisApiRequest<VisitDetail>(VISITS_API_PATHS.detail(uuid), {
      token: auth.accessToken,
    });

    return bffSuccess(visit);
  } catch (error) {
    return bffError(error);
  }
}

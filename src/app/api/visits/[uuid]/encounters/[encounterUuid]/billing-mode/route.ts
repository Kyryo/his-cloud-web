import { VISITS_API_PATHS } from "@/constants/visits-api";
import type { VisitEncounter } from "@/features/visits/types/visit.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ uuid: string; encounterUuid: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { uuid, encounterUuid } = await context.params;
    const body = await request.json();

    const encounter = await hmisApiRequest<VisitEncounter>(
      VISITS_API_PATHS.encounterBillingMode(uuid, encounterUuid),
      {
        method: "POST",
        token: auth.accessToken,
        body,
      },
    );

    return bffSuccess(encounter);
  } catch (error) {
    return bffError(error);
  }
}

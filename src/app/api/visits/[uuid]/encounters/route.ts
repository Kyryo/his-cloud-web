import { VISITS_API_PATHS } from "@/constants/visits-api";
import type { VisitEncounter, VisitEncounterCreatePayload } from "@/features/visits/types/visit.types";
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
    const encounters = await hmisApiRequest<VisitEncounter[]>(
      VISITS_API_PATHS.encounters(uuid),
      { token: auth.accessToken },
    );

    return bffSuccess(encounters);
  } catch (error) {
    return bffError(error);
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { uuid } = await context.params;
    const body = (await request.json()) as VisitEncounterCreatePayload;

    const encounter = await hmisApiRequest<VisitEncounter>(
      VISITS_API_PATHS.encounters(uuid),
      {
        method: "POST",
        token: auth.accessToken,
        body,
      },
    );

    return bffSuccess(encounter, 201);
  } catch (error) {
    return bffError(error);
  }
}

import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { handleClinicalCreate } from "@/lib/server/clinical-bff-handlers";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ visitUuid: string; encounterUuid: string }>;
};

async function listEncounterResource(upstreamPath: string) {
  const auth = await requireAccessToken();
  if ("error" in auth) {
    return auth.error;
  }

  const results = await hmisApiRequest<unknown[]>(upstreamPath, {
    token: auth.accessToken,
  });
  return bffSuccess({ results });
}

export function buildEncounterListHandlers(
  pathBuilder: (visitUuid: string, encounterUuid: string) => string,
) {
  return {
    GET: async (_request: Request, context: RouteContext) => {
      try {
        const { visitUuid, encounterUuid } = await context.params;
        return await listEncounterResource(
          pathBuilder(visitUuid, encounterUuid),
        );
      } catch (error) {
        return bffError(error);
      }
    },
    POST: async (request: Request, context: RouteContext) => {
      const { visitUuid, encounterUuid } = await context.params;
      return handleClinicalCreate(
        request,
        pathBuilder(visitUuid, encounterUuid),
      );
    },
  };
}

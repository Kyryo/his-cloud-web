import { VISITS_API_PATHS } from "@/constants/visits-api";
import type { VisitEncounterAction } from "@/features/visits/services/visits.service";
import { handleClinicalAction } from "@/lib/server/clinical-bff-handlers";

type RouteContext = {
  params: Promise<{ uuid: string; encounterUuid: string }>;
};

export function createVisitEncounterActionRoute(action: VisitEncounterAction) {
  return async function POST(_request: Request, context: RouteContext) {
    const { uuid, encounterUuid } = await context.params;

    const upstreamPath =
      action === "start"
        ? VISITS_API_PATHS.encounterStart(uuid, encounterUuid)
        : action === "complete"
          ? VISITS_API_PATHS.encounterComplete(uuid, encounterUuid)
          : VISITS_API_PATHS.encounterCancel(uuid, encounterUuid);

    return handleClinicalAction(upstreamPath, "user");
  };
}

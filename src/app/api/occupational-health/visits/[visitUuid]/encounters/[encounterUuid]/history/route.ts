import { OCCUPATIONAL_HEALTH_API_PATHS } from "@/constants/occupational-health-api";
import { handleClinicalObjectGet } from "@/lib/server/clinical-bff-handlers";

type RouteContext = {
  params: Promise<{ visitUuid: string; encounterUuid: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { visitUuid, encounterUuid } = await context.params;
  return handleClinicalObjectGet(
    request,
    OCCUPATIONAL_HEALTH_API_PATHS.encounterHistory(visitUuid, encounterUuid),
    ["history_encounter_uuid"],
  );
}

import { CLINICAL_OPD_API_PATHS } from "@/constants/clinical-opd-api";
import { handleClinicalObjectGet } from "@/lib/server/clinical-bff-handlers";

type RouteContext = {
  params: Promise<{ visitUuid: string; encounterUuid: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { visitUuid, encounterUuid } = await context.params;
  return handleClinicalObjectGet(
    CLINICAL_OPD_API_PATHS.encounterTimeline(visitUuid, encounterUuid),
  );
}

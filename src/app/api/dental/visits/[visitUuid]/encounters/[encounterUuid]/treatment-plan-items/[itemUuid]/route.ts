import { CLINICAL_DENTAL_API_PATHS } from "@/constants/clinical-dental-api";
import { handleClinicalPatch } from "@/lib/server/clinical-bff-handlers";

type RouteContext = {
  params: Promise<{ visitUuid: string; encounterUuid: string; itemUuid: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { visitUuid, encounterUuid, itemUuid } = await context.params;
  return handleClinicalPatch(
    request,
    CLINICAL_DENTAL_API_PATHS.treatmentPlanItem(visitUuid, encounterUuid, itemUuid),
  );
}

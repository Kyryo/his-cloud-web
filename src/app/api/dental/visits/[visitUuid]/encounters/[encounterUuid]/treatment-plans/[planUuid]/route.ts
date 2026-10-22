import { CLINICAL_DENTAL_API_PATHS } from "@/constants/clinical-dental-api";
import { handleClinicalPatch } from "@/lib/server/clinical-bff-handlers";

type RouteContext = {
  params: Promise<{ visitUuid: string; encounterUuid: string; planUuid: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { visitUuid, encounterUuid, planUuid } = await context.params;
  return handleClinicalPatch(
    request,
    CLINICAL_DENTAL_API_PATHS.treatmentPlan(visitUuid, encounterUuid, planUuid),
  );
}

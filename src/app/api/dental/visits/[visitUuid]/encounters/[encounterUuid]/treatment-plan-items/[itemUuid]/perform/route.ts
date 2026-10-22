import { CLINICAL_DENTAL_API_PATHS } from "@/constants/clinical-dental-api";
import { handleClinicalCreate } from "@/lib/server/clinical-bff-handlers";

type RouteContext = {
  params: Promise<{ visitUuid: string; encounterUuid: string; itemUuid: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { visitUuid, encounterUuid, itemUuid } = await context.params;
  return handleClinicalCreate(
    request,
    CLINICAL_DENTAL_API_PATHS.performPlanItem(visitUuid, encounterUuid, itemUuid),
    "user",
    "perform dental plan item",
  );
}

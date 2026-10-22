import { CLINICAL_DENTAL_API_PATHS } from "@/constants/clinical-dental-api";
import { handleClinicalCreate } from "@/lib/server/clinical-bff-handlers";

type RouteContext = {
  params: Promise<{ visitUuid: string; encounterUuid: string; planUuid: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { visitUuid, encounterUuid, planUuid } = await context.params;
  return handleClinicalCreate(
    request,
    CLINICAL_DENTAL_API_PATHS.treatmentPlanItems(visitUuid, encounterUuid, planUuid),
    "user",
    "dental treatment plan item",
  );
}

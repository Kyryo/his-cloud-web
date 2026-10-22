import { CLINICAL_DENTAL_API_PATHS } from "@/constants/clinical-dental-api";
import {
  handleClinicalDelete,
  handleClinicalPatch,
} from "@/lib/server/clinical-bff-handlers";

type RouteContext = {
  params: Promise<{ visitUuid: string; encounterUuid: string; findingUuid: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { visitUuid, encounterUuid, findingUuid } = await context.params;
  return handleClinicalPatch(
    request,
    CLINICAL_DENTAL_API_PATHS.chartFinding(visitUuid, encounterUuid, findingUuid),
  );
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { visitUuid, encounterUuid, findingUuid } = await context.params;
  return handleClinicalDelete(
    CLINICAL_DENTAL_API_PATHS.chartFinding(visitUuid, encounterUuid, findingUuid),
  );
}

import { CLINICAL_OPD_API_PATHS } from "@/constants/clinical-opd-api";
import { handleClinicalPatch } from "@/lib/server/clinical-bff-handlers";

type RouteContext = {
  params: Promise<{
    visitUuid: string;
    encounterUuid: string;
    medicationUuid: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { visitUuid, encounterUuid, medicationUuid } = await context.params;
  return handleClinicalPatch(
    request,
    CLINICAL_OPD_API_PATHS.encounterCurrentMedication(
      visitUuid,
      encounterUuid,
      medicationUuid,
    ),
  );
}

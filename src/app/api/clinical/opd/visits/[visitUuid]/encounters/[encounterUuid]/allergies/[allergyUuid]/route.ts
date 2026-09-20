import { CLINICAL_OPD_API_PATHS } from "@/constants/clinical-opd-api";
import { handleClinicalPatch } from "@/lib/server/clinical-bff-handlers";

type RouteContext = {
  params: Promise<{
    visitUuid: string;
    encounterUuid: string;
    allergyUuid: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { visitUuid, encounterUuid, allergyUuid } = await context.params;
  return handleClinicalPatch(
    request,
    CLINICAL_OPD_API_PATHS.encounterAllergy(
      visitUuid,
      encounterUuid,
      allergyUuid,
    ),
  );
}

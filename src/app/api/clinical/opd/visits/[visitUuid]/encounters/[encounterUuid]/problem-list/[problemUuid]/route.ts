import { CLINICAL_OPD_API_PATHS } from "@/constants/clinical-opd-api";
import { handleClinicalPatch } from "@/lib/server/clinical-bff-handlers";

type RouteContext = {
  params: Promise<{
    visitUuid: string;
    encounterUuid: string;
    problemUuid: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { visitUuid, encounterUuid, problemUuid } = await context.params;
  return handleClinicalPatch(
    request,
    CLINICAL_OPD_API_PATHS.encounterProblem(
      visitUuid,
      encounterUuid,
      problemUuid,
    ),
  );
}

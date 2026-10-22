import { CLINICAL_DENTAL_API_PATHS } from "@/constants/clinical-dental-api";
import {
  handleClinicalDelete,
  handleClinicalPatch,
} from "@/lib/server/clinical-bff-handlers";

type RouteContext = {
  params: Promise<{
    visitUuid: string;
    encounterUuid: string;
    procedureUuid: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { visitUuid, encounterUuid, procedureUuid } = await context.params;
  return handleClinicalPatch(
    request,
    CLINICAL_DENTAL_API_PATHS.procedure(visitUuid, encounterUuid, procedureUuid),
  );
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { visitUuid, encounterUuid, procedureUuid } = await context.params;
  return handleClinicalDelete(
    CLINICAL_DENTAL_API_PATHS.procedure(visitUuid, encounterUuid, procedureUuid),
  );
}

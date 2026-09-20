import { CLINICAL_OPD_API_PATHS } from "@/constants/clinical-opd-api";
import {
  handleClinicalObjectGet,
  handleClinicalPut,
} from "@/lib/server/clinical-bff-handlers";

type RouteContext = {
  params: Promise<{ visitUuid: string; encounterUuid: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { visitUuid, encounterUuid } = await context.params;
  return handleClinicalObjectGet(
    request,
    CLINICAL_OPD_API_PATHS.encounterDisposition(visitUuid, encounterUuid),
  );
}

export async function PUT(request: Request, context: RouteContext) {
  const { visitUuid, encounterUuid } = await context.params;
  return handleClinicalPut(
    request,
    CLINICAL_OPD_API_PATHS.encounterDisposition(visitUuid, encounterUuid),
  );
}

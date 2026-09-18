import { CLINICAL_OPD_API_PATHS } from "@/constants/clinical-opd-api";
import {
  handleClinicalCreate,
  handleClinicalDelete,
  handleClinicalObjectGet,
  handleClinicalPatch,
} from "@/lib/server/clinical-bff-handlers";

type RouteContext = {
  params: Promise<{
    visitUuid: string;
    encounterUuid: string;
    complaintUuid: string;
  }>;
};

function hpiPath(
  visitUuid: string,
  encounterUuid: string,
  complaintUuid: string,
) {
  return CLINICAL_OPD_API_PATHS.encounterChiefComplaintHpi(
    visitUuid,
    encounterUuid,
    complaintUuid,
  );
}

export async function GET(request: Request, context: RouteContext) {
  const { visitUuid, encounterUuid, complaintUuid } = await context.params;
  return handleClinicalObjectGet(
    request,
    hpiPath(visitUuid, encounterUuid, complaintUuid),
  );
}

export async function POST(request: Request, context: RouteContext) {
  const { visitUuid, encounterUuid, complaintUuid } = await context.params;
  return handleClinicalCreate(
    request,
    hpiPath(visitUuid, encounterUuid, complaintUuid),
  );
}

export async function PATCH(request: Request, context: RouteContext) {
  const { visitUuid, encounterUuid, complaintUuid } = await context.params;
  return handleClinicalPatch(
    request,
    hpiPath(visitUuid, encounterUuid, complaintUuid),
  );
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { visitUuid, encounterUuid, complaintUuid } = await context.params;
  return handleClinicalDelete(hpiPath(visitUuid, encounterUuid, complaintUuid));
}

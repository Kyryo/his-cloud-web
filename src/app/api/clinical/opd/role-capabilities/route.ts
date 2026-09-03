import { CLINICAL_OPD_API_PATHS } from "@/constants/clinical-opd-api";
import {
  handleClinicalObjectGet,
  handleClinicalPatch,
} from "@/lib/server/clinical-bff-handlers";

export async function GET(request: Request) {
  return handleClinicalObjectGet(
    request,
    CLINICAL_OPD_API_PATHS.roleCapabilities,
    [],
    "admin",
  );
}

export async function PATCH(request: Request) {
  return handleClinicalPatch(
    request,
    CLINICAL_OPD_API_PATHS.roleCapabilities,
    "admin",
  );
}

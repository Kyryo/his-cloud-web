import { CLINICAL_OPD_API_PATHS } from "@/constants/clinical-opd-api";
import { handleClinicalObjectGet } from "@/lib/server/clinical-bff-handlers";

export async function GET(request: Request) {
  return handleClinicalObjectGet(
    request,
    CLINICAL_OPD_API_PATHS.observationDefinitions,
  );
}

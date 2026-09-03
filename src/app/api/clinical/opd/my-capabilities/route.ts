import { handleClinicalObjectGet } from "@/lib/server/clinical-bff-handlers";
import { CLINICAL_OPD_API_PATHS } from "@/constants/clinical-opd-api";

export async function GET(request: Request) {
  return handleClinicalObjectGet(
    request,
    CLINICAL_OPD_API_PATHS.myCapabilities,
    [],
    "user",
  );
}

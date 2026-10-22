import { CLINICAL_WORKSPACE_API_PATHS } from "@/constants/clinical-workspace-api";
import type { ClinicalSpecialtyCatalog } from "@/features/clinical-workspace/types/clinical-workspace.types";
import { handleClinicalObjectGet } from "@/lib/server/clinical-bff-handlers";

export async function GET(request: Request) {
  return handleClinicalObjectGet<ClinicalSpecialtyCatalog>(
    request,
    CLINICAL_WORKSPACE_API_PATHS.specialties,
  );
}

import { CLINICAL_DENTAL_API_PATHS } from "@/constants/clinical-dental-api";
import type { DentalChart } from "@/features/clinical-dental/types/clinical-dental.types";
import { handleClinicalObjectGet } from "@/lib/server/clinical-bff-handlers";

type RouteContext = {
  params: Promise<{ visitUuid: string; encounterUuid: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { visitUuid, encounterUuid } = await context.params;
  return handleClinicalObjectGet<DentalChart>(
    request,
    CLINICAL_DENTAL_API_PATHS.chart(visitUuid, encounterUuid),
  );
}

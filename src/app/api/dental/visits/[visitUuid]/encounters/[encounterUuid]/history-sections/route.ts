import { CLINICAL_DENTAL_API_PATHS } from "@/constants/clinical-dental-api";
import type { DentalHistorySections } from "@/features/clinical-dental/types/clinical-dental.types";
import { handleClinicalObjectGet } from "@/lib/server/clinical-bff-handlers";

const QUERY_KEYS = ["history_encounter_uuid"] as const;

type RouteContext = {
  params: Promise<{ visitUuid: string; encounterUuid: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { visitUuid, encounterUuid } = await context.params;
  return handleClinicalObjectGet<DentalHistorySections>(
    request,
    CLINICAL_DENTAL_API_PATHS.historySections(visitUuid, encounterUuid),
    QUERY_KEYS,
  );
}

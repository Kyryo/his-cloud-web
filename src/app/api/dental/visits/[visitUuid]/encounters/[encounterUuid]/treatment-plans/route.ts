import { CLINICAL_DENTAL_API_PATHS } from "@/constants/clinical-dental-api";
import type { DentalTreatmentPlan } from "@/features/clinical-dental/types/clinical-dental.types";
import {
  handleClinicalCreate,
  handleClinicalObjectGet,
} from "@/lib/server/clinical-bff-handlers";

type RouteContext = {
  params: Promise<{ visitUuid: string; encounterUuid: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { visitUuid, encounterUuid } = await context.params;
  return handleClinicalObjectGet<DentalTreatmentPlan[]>(
    request,
    CLINICAL_DENTAL_API_PATHS.treatmentPlans(visitUuid, encounterUuid),
  );
}

export async function POST(request: Request, context: RouteContext) {
  const { visitUuid, encounterUuid } = await context.params;
  return handleClinicalCreate(
    request,
    CLINICAL_DENTAL_API_PATHS.treatmentPlans(visitUuid, encounterUuid),
    "user",
    "dental treatment plan",
  );
}

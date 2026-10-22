import { CLINICAL_DENTAL_API_PATHS } from "@/constants/clinical-dental-api";
import { handleClinicalCreate } from "@/lib/server/clinical-bff-handlers";

type RouteContext = {
  params: Promise<{ visitUuid: string; encounterUuid: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { visitUuid, encounterUuid } = await context.params;
  return handleClinicalCreate(
    request,
    CLINICAL_DENTAL_API_PATHS.chartFindings(visitUuid, encounterUuid),
    "user",
    "dental chart finding",
  );
}

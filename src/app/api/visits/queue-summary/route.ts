import { VISITS_API_PATHS } from "@/constants/visits-api";
import { handleClinicalObjectGet } from "@/lib/server/clinical-bff-handlers";

const QUERY_KEYS = ["clinic_uuid", "department_uuid", "customer_uuid"] as const;

export async function GET(request: Request) {
  return handleClinicalObjectGet(
    request,
    VISITS_API_PATHS.queueSummary,
    QUERY_KEYS,
    "user",
  );
}

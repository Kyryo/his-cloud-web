import { APPOINTMENTS_API_PATHS } from "@/constants/appointments-api";
import { handleClinicalObjectGet } from "@/lib/server/clinical-bff-handlers";

export async function GET(request: Request) {
  return handleClinicalObjectGet(
    request,
    APPOINTMENTS_API_PATHS.summaryStats,
    [],
    "user",
  );
}

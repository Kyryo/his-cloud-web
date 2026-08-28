import { CUSTOMERS_API_PATHS } from "@/constants/customers-api";
import { handleClinicalObjectGet } from "@/lib/server/clinical-bff-handlers";

export async function GET(request: Request) {
  return handleClinicalObjectGet(
    request,
    CUSTOMERS_API_PATHS.summaryStats,
    [],
    "user",
  );
}

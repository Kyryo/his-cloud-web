import { OCCUPATIONAL_HEALTH_API_PATHS } from "@/constants/occupational-health-api";
import { ohComplianceExtractHandler } from "@/lib/server/occupational-health-bff";

export async function POST() {
  return ohComplianceExtractHandler(
    OCCUPATIONAL_HEALTH_API_PATHS.complianceExtract,
  );
}

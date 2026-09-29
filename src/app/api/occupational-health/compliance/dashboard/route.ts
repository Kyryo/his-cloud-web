import { OCCUPATIONAL_HEALTH_API_PATHS } from "@/constants/occupational-health-api";
import { ohComplianceDashboardHandler } from "@/lib/server/occupational-health-bff";

export async function GET() {
  return ohComplianceDashboardHandler(
    OCCUPATIONAL_HEALTH_API_PATHS.complianceDashboard,
  );
}

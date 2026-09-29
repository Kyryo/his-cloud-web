import { OCCUPATIONAL_HEALTH_API_PATHS } from "@/constants/occupational-health-api";
import { ohCampaignQueueHandler } from "@/lib/server/occupational-health-bff";

export async function GET() {
  return ohCampaignQueueHandler(
    OCCUPATIONAL_HEALTH_API_PATHS.fitnessValidityAlerts,
  );
}

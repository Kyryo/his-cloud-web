import { OCCUPATIONAL_HEALTH_API_PATHS } from "@/constants/occupational-health-api";
import { ohHrFitnessHandler } from "@/lib/server/occupational-health-bff";

export async function GET(request: Request) {
  return ohHrFitnessHandler(OCCUPATIONAL_HEALTH_API_PATHS.hrFitness, request);
}

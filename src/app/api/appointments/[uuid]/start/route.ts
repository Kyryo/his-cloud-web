import { APPOINTMENTS_API_PATHS } from "@/constants/appointments-api";
import { handleClinicalAction } from "@/lib/server/clinical-bff-handlers";

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { uuid } = await context.params;
  const body = await request.json().catch(() => ({}));
  return handleClinicalAction(APPOINTMENTS_API_PATHS.start(uuid), "user", body);
}

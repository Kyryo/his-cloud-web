import { APPOINTMENTS_API_PATHS } from "@/constants/appointments-api";
import { handleClinicalAction } from "@/lib/server/clinical-bff-handlers";

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { uuid } = await context.params;
  return handleClinicalAction(APPOINTMENTS_API_PATHS.noShow(uuid), "user");
}

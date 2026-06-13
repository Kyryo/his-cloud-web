import { APPOINTMENTS_API_PATHS } from "@/constants/appointments-api";
import {
  handleClinicalDetailGet,
  handleClinicalPatch,
} from "@/lib/server/clinical-bff-handlers";

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { uuid } = await context.params;
  return handleClinicalDetailGet(APPOINTMENTS_API_PATHS.detail(uuid), "user");
}

export async function PATCH(request: Request, context: RouteContext) {
  const { uuid } = await context.params;
  return handleClinicalPatch(request, APPOINTMENTS_API_PATHS.detail(uuid), "user");
}

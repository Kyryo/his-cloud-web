import { CLINICS_API_PATHS } from "@/constants/clinics-api";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

async function postClinicAction(
  context: RouteContext,
  pathFor: (uuid: string) => string,
) {
  const admin = await requireTenantAdmin();
  if ("error" in admin) {
    return admin.error;
  }

  const { uuid } = await context.params;
  const clinic = await hmisApiRequest(pathFor(uuid), {
    method: "POST",
    token: admin.accessToken,
  });
  return bffSuccess(clinic);
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    return await postClinicAction(context, CLINICS_API_PATHS.deactivate);
  } catch (error) {
    return bffError(error);
  }
}

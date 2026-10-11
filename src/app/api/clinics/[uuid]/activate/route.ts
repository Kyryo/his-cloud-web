import { CLINICS_API_PATHS } from "@/constants/clinics-api";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const { uuid } = await context.params;
    const clinic = await hmisApiRequest(CLINICS_API_PATHS.activate(uuid), {
      method: "POST",
      token: admin.accessToken,
    });
    return bffSuccess(clinic);
  } catch (error) {
    return bffError(error);
  }
}

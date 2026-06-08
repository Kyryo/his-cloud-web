import { CLINICS_API_PATHS } from "@/constants/clinics-api";
import type {
  OrganizationClinic,
  UpdateOrganizationClinicPayload,
} from "@/features/settings/types/settings.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const { uuid } = await context.params;
    const body = (await request.json()) as UpdateOrganizationClinicPayload;

    if (!body.name?.trim()) {
      return bffSuccess({ message: "Name is required." }, 400);
    }

    const clinic = await hmisApiRequest<OrganizationClinic>(
      CLINICS_API_PATHS.detail(uuid),
      {
        method: "PATCH",
        token: admin.accessToken,
        body: { name: body.name.trim() },
      },
    );

    return bffSuccess(clinic);
  } catch (error) {
    return bffError(error);
  }
}

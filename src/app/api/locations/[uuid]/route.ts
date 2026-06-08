import { LOCATIONS_API_PATHS } from "@/constants/locations-api";
import type {
  OrganizationLocation,
  UpdateOrganizationLocationPayload,
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
    const body = (await request.json()) as UpdateOrganizationLocationPayload;

    if (!body.name?.trim() || !body.code?.trim() || !body.clinic) {
      return bffSuccess(
        { message: "Name, code, and clinic are required." },
        400,
      );
    }

    const location = await hmisApiRequest<OrganizationLocation>(
      LOCATIONS_API_PATHS.detail(uuid),
      {
        method: "PATCH",
        token: admin.accessToken,
        body: {
          name: body.name.trim(),
          code: body.code.trim(),
          clinic: body.clinic,
          description: body.description?.trim() || "",
        },
      },
    );

    return bffSuccess(location);
  } catch (error) {
    return bffError(error);
  }
}

import { VISIT_TYPES_API_PATHS } from "@/constants/visit-types-api";
import type {
  OrganizationService,
  UpdateOrganizationServicePayload,
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
    const body = (await request.json()) as UpdateOrganizationServicePayload;

    if (!body.name?.trim()) {
      return bffSuccess({ message: "Name is required." }, 400);
    }

    const service = await hmisApiRequest<OrganizationService>(
      VISIT_TYPES_API_PATHS.detail(uuid),
      {
        method: "PATCH",
        token: admin.accessToken,
        body: {
          name: body.name.trim(),
          code: body.code?.trim() || "",
          description: body.description?.trim() || "",
          is_chargable: body.is_chargable ?? true,
        },
      },
    );

    return bffSuccess(service);
  } catch (error) {
    return bffError(error);
  }
}

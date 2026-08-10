import { INSURANCE_API_PATHS } from "@/constants/insurance-api";
import type {
  OrganizationPayerScheme,
  UpdateOrganizationPayerSchemePayload,
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
    const body = (await request.json()) as UpdateOrganizationPayerSchemePayload;

    if (typeof body.is_active !== "boolean") {
      return bffSuccess({ message: "is_active is required." }, 400);
    }

    const scheme = await hmisApiRequest<OrganizationPayerScheme>(
      INSURANCE_API_PATHS.schemeDetail(uuid),
      {
        method: "PATCH",
        token: admin.accessToken,
        body: {
          is_active: body.is_active,
        },
      },
    );

    return bffSuccess(scheme);
  } catch (error) {
    return bffError(error);
  }
}

import { EMAIL_CONFIGURATION_API_PATHS } from "@/constants/email-configuration-api";
import type {
  TenantEmailConfiguration,
  UpdateTenantEmailConfigurationPayload,
} from "@/features/settings/types/settings.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const { id } = await context.params;
    const body = (await request.json()) as UpdateTenantEmailConfigurationPayload;

    const configuration = await hmisApiRequest<TenantEmailConfiguration>(
      EMAIL_CONFIGURATION_API_PATHS.detail(id),
      {
        method: "PATCH",
        token: admin.accessToken,
        body,
      },
    );

    return bffSuccess({ configuration });
  } catch (error) {
    return bffError(error);
  }
}

import { EMAIL_CONFIGURATION_API_PATHS } from "@/constants/email-configuration-api";
import type {
  CreateTenantEmailConfigurationPayload,
  TenantEmailConfiguration,
} from "@/features/settings/types/settings.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest, hmisApiRequestWithMeta } from "@/lib/server/hmis-api";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

export async function GET() {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const { data, meta } = await hmisApiRequestWithMeta<TenantEmailConfiguration[]>(
      `${EMAIL_CONFIGURATION_API_PATHS.list}?page_size=1`,
      { token: admin.accessToken },
    );

    return bffSuccess({
      configuration: data[0] ?? null,
      pagination: meta.pagination ?? null,
    });
  } catch (error) {
    return bffError(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const body = (await request.json()) as CreateTenantEmailConfigurationPayload;

    const configuration = await hmisApiRequest<TenantEmailConfiguration>(
      EMAIL_CONFIGURATION_API_PATHS.list,
      {
        method: "POST",
        token: admin.accessToken,
        body,
      },
    );

    return bffSuccess({ configuration }, 201);
  } catch (error) {
    return bffError(error);
  }
}

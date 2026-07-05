import { CARE_PROVIDERS_API_PATHS } from "@/constants/care-providers-api";
import type { CareProviderRecord } from "@/features/care-providers/types/care-provider.types";
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
    const body = await request.json();
    const provider = await hmisApiRequest<CareProviderRecord>(
      CARE_PROVIDERS_API_PATHS.detail(uuid),
      {
        method: "PATCH",
        token: admin.accessToken,
        body,
      },
    );

    return bffSuccess(provider);
  } catch (error) {
    return bffError(error);
  }
}

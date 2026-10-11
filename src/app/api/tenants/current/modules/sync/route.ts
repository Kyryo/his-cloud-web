import { TENANTS_API_PATHS } from "@/constants/tenants-api";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

export async function POST() {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const result = await hmisApiRequest(TENANTS_API_PATHS.syncModules(admin.tenantUuid), {
      method: "POST",
      token: admin.accessToken,
    });
    return bffSuccess(result);
  } catch (error) {
    return bffError(error);
  }
}

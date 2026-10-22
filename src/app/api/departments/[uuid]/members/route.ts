import { DEPARTMENTS_API_PATHS } from "@/constants/departments-api";
import type { DepartmentMember } from "@/features/settings/types/settings.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }
    const { uuid } = await context.params;
    const results = await hmisApiRequest<DepartmentMember[]>(
      DEPARTMENTS_API_PATHS.members(uuid),
      { token: admin.accessToken },
    );
    return bffSuccess({ results });
  } catch (error) {
    return bffError(error);
  }
}

import { USER_ASSOCIATIONS_API_PATHS } from "@/constants/user-associations-api";
import type { UserClinicAssociation } from "@/features/settings/types/settings.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const { id } = await context.params;
    const associationId = Number.parseInt(id, 10);

    if (!Number.isFinite(associationId)) {
      return bffSuccess({ message: "Invalid association id." }, 400);
    }

    const association = await hmisApiRequest<UserClinicAssociation>(
      USER_ASSOCIATIONS_API_PATHS.userClinicSetPrimary(associationId),
      {
        method: "POST",
        token: admin.accessToken,
      },
    );

    return bffSuccess(association);
  } catch (error) {
    return bffError(error);
  }
}

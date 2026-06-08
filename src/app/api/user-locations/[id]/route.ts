import { USER_ASSOCIATIONS_API_PATHS } from "@/constants/user-associations-api";
import type {
  UpdateUserLocationAssociationPayload,
  UserLocationAssociation,
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
    const associationId = Number.parseInt(id, 10);

    if (!Number.isFinite(associationId)) {
      return bffSuccess({ message: "Invalid association id." }, 400);
    }

    const body = (await request.json()) as UpdateUserLocationAssociationPayload;
    const association = await hmisApiRequest<UserLocationAssociation>(
      USER_ASSOCIATIONS_API_PATHS.userLocationDetail(associationId),
      {
        method: "PATCH",
        token: admin.accessToken,
        body,
      },
    );

    return bffSuccess(association);
  } catch (error) {
    return bffError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
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

    await hmisApiRequest<void>(
      USER_ASSOCIATIONS_API_PATHS.userLocationDetail(associationId),
      {
        method: "DELETE",
        token: admin.accessToken,
      },
    );

    return bffSuccess({ success: true });
  } catch (error) {
    return bffError(error);
  }
}

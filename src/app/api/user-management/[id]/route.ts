import { USERS_API_PATHS } from "@/constants/users-api";
import type {
  OrganizationUser,
  UpdateOrganizationUserPayload,
} from "@/features/settings/types/settings.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { pickOrganizationUserPayload } from "@/lib/server/pick-organization-user-payload";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const { id } = await context.params;
    const userId = Number.parseInt(id, 10);

    if (!Number.isFinite(userId)) {
      return bffSuccess({ message: "Invalid user id." }, 400);
    }

    const user = await hmisApiRequest<OrganizationUser>(
      USERS_API_PATHS.detail(userId),
      { token: admin.accessToken },
    );

    return bffSuccess(user);
  } catch (error) {
    return bffError(error);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const { id } = await context.params;
    const userId = Number.parseInt(id, 10);

    if (!Number.isFinite(userId)) {
      return bffSuccess({ message: "Invalid user id." }, 400);
    }

    const body = (await request.json()) as UpdateOrganizationUserPayload;
    const payload = pickOrganizationUserPayload(body);

    if (Object.keys(payload).length === 0) {
      return bffSuccess({ message: "No valid fields to update." }, 400);
    }

    const user = await hmisApiRequest<OrganizationUser>(
      USERS_API_PATHS.detail(userId),
      {
        method: "PATCH",
        token: admin.accessToken,
        body: payload,
      },
    );

    return bffSuccess(user);
  } catch (error) {
    return bffError(error);
  }
}

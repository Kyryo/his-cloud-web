import { GROUPS_API_PATHS } from "@/constants/groups-api";
import type {
  OrganizationGroup,
  OrganizationGroupDetail,
  UpdateOrganizationGroupPayload,
} from "@/features/settings/types/settings.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
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
    const groupId = Number.parseInt(id, 10);

    if (!Number.isFinite(groupId)) {
      return bffSuccess({ message: "Invalid group id." }, 400);
    }

    const group = await hmisApiRequest<OrganizationGroupDetail>(
      GROUPS_API_PATHS.detail(groupId),
      { token: admin.accessToken },
    );

    return bffSuccess(group);
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
    const groupId = Number.parseInt(id, 10);

    if (!Number.isFinite(groupId)) {
      return bffSuccess({ message: "Invalid group id." }, 400);
    }

    const body = (await request.json()) as UpdateOrganizationGroupPayload;

    if (!body.name?.trim()) {
      return bffSuccess({ message: "Group name is required." }, 400);
    }

    const group = await hmisApiRequest<OrganizationGroup>(
      GROUPS_API_PATHS.detail(groupId),
      {
        method: "PATCH",
        token: admin.accessToken,
        body: {
          name: body.name.trim(),
        },
      },
    );

    return bffSuccess(group);
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
    const groupId = Number.parseInt(id, 10);

    if (!Number.isFinite(groupId)) {
      return bffSuccess({ message: "Invalid group id." }, 400);
    }

    await hmisApiRequest<void>(GROUPS_API_PATHS.detail(groupId), {
      method: "DELETE",
      token: admin.accessToken,
    });

    return bffSuccess({ success: true });
  } catch (error) {
    return bffError(error);
  }
}

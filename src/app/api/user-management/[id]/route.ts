import { USERS_API_PATHS } from "@/constants/users-api";
import type {
  OrganizationUser,
  UpdateOrganizationUserPayload,
} from "@/features/settings/types/settings.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const UPDATABLE_FIELDS = [
  "name",
  "email",
  "password",
  "user_role",
] as const satisfies ReadonlyArray<keyof UpdateOrganizationUserPayload>;

function pickUserPayload(body: UpdateOrganizationUserPayload) {
  const payload: UpdateOrganizationUserPayload = {};

  for (const field of UPDATABLE_FIELDS) {
    if (field in body) {
      const value = body[field];
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (field === "password" && trimmed === "") {
          continue;
        }
        if (field === "user_role") {
          payload.user_role = trimmed as UpdateOrganizationUserPayload["user_role"];
        } else {
          payload[field] = trimmed;
        }
      }
    }
  }

  return payload;
}

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
    const payload = pickUserPayload(body);

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

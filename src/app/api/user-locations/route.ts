import { USER_ASSOCIATIONS_API_PATHS } from "@/constants/user-associations-api";
import type {
  CreateUserLocationAssociationPayload,
  UserLocationAssociation,
} from "@/features/settings/types/settings.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest, hmisApiRequestWithMeta } from "@/lib/server/hmis-api";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

export async function GET(request: Request) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const userId = new URL(request.url).searchParams.get("user_id");
    const query = userId ? `?user_id=${encodeURIComponent(userId)}` : "";

    const { data, meta } = await hmisApiRequestWithMeta<UserLocationAssociation[]>(
      `${USER_ASSOCIATIONS_API_PATHS.userLocations}${query}`,
      { token: admin.accessToken },
    );

    return bffSuccess({
      results: data,
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

    const body = (await request.json()) as CreateUserLocationAssociationPayload;

    if (!body.user || !body.location_id) {
      return bffSuccess({ message: "User and location are required." }, 400);
    }

    const association = await hmisApiRequest<UserLocationAssociation>(
      USER_ASSOCIATIONS_API_PATHS.userLocations,
      {
        method: "POST",
        token: admin.accessToken,
        body: {
          user: body.user,
          location_id: body.location_id,
          role: body.role ?? "staff",
          is_primary: body.is_primary ?? false,
        },
      },
    );

    return bffSuccess(association, 201);
  } catch (error) {
    return bffError(error);
  }
}

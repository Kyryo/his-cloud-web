import { USER_ASSOCIATIONS_API_PATHS } from "@/constants/user-associations-api";
import type {
  CreateUserClinicAssociationPayload,
  UserClinicAssociation,
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

    const { data, meta } = await hmisApiRequestWithMeta<UserClinicAssociation[]>(
      `${USER_ASSOCIATIONS_API_PATHS.userClinics}${query}`,
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

    const body = (await request.json()) as CreateUserClinicAssociationPayload;

    if (!body.user || !body.clinic_id) {
      return bffSuccess({ message: "User and clinic are required." }, 400);
    }

    const association = await hmisApiRequest<UserClinicAssociation>(
      USER_ASSOCIATIONS_API_PATHS.userClinics,
      {
        method: "POST",
        token: admin.accessToken,
        body: {
          user: body.user,
          clinic_id: body.clinic_id,
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

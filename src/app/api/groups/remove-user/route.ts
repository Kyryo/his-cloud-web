import { GROUPS_API_PATHS } from "@/constants/groups-api";
import type { GroupMembershipPayload } from "@/features/settings/types/settings.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

export async function POST(request: Request) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const body = (await request.json()) as GroupMembershipPayload;

    if (!body.user_id || !body.group_id) {
      return bffSuccess({ message: "User and group are required." }, 400);
    }

    const result = await hmisApiRequest<{ message: string }>(
      GROUPS_API_PATHS.removeUser,
      {
        method: "POST",
        token: admin.accessToken,
        body: {
          user_id: body.user_id,
          group_id: body.group_id,
        },
      },
    );

    return bffSuccess(result);
  } catch (error) {
    return bffError(error);
  }
}

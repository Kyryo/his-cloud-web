import { bffSuccess } from "@/lib/server/bff-response";
import { requireAccessToken } from "@/lib/server/require-access-token";
import { resolveSession } from "@/lib/server/session";
import type { User } from "@/features/auth/types/auth.types";

type TenantAdminContext = {
  user: User;
  tenantUuid: string;
  accessToken: string;
};

export async function requireTenantAdmin():
  Promise<{ error: Response } | TenantAdminContext> {
  const session = await resolveSession();
  if (!session.authenticated || !session.user) {
    return { error: bffSuccess({ message: "Not authenticated." }, 401) };
  }

  if (!session.user.is_admin) {
    return {
      error: bffSuccess(
        { message: "Only tenant administrators can access organization settings." },
        403,
      ),
    };
  }

  const tenantUuid = session.user.tenant?.uuid;
  if (!tenantUuid) {
    return {
      error: bffSuccess(
        { message: "No organization is linked to this account." },
        404,
      ),
    };
  }

  const auth = await requireAccessToken();
  if ("error" in auth) {
    return {
      error: auth.error ?? bffSuccess({ message: "Not authenticated." }, 401),
    };
  }

  return {
    user: session.user,
    tenantUuid,
    accessToken: auth.accessToken,
  };
}

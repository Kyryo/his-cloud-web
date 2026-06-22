import { bffSuccess } from "@/lib/server/bff-response";
import { requireAccessToken } from "@/lib/server/require-access-token";
import { resolveSession } from "@/lib/server/session";
import type { User } from "@/features/auth/types/auth.types";

type PlatformAdminContext = {
  user: User;
  accessToken: string;
};

export async function requirePlatformAdmin(): Promise<
  { error: Response } | PlatformAdminContext
> {
  const session = await resolveSession();
  if (!session.authenticated || !session.user) {
    return { error: bffSuccess({ message: "Not authenticated." }, 401) };
  }

  if (!session.user.is_superuser || session.user.tenant !== null) {
    return {
      error: bffSuccess(
        { message: "Only platform administrators can access this area." },
        403,
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
    accessToken: auth.accessToken,
  };
}

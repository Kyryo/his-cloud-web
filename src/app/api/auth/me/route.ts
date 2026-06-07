import { AUTH_API_PATHS } from "@/constants/auth-api";
import type { User } from "@/features/auth/types/auth.types";
import { joinDisplayName } from "@/features/settings/utils/user-name";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";
import { resolveSession } from "@/lib/server/session";

export async function GET() {
  try {
    const session = await resolveSession();
    if (!session.authenticated || !session.user) {
      return bffSuccess({ message: "Not authenticated." }, 401);
    }

    return bffSuccess({ user: session.user });
  } catch (error) {
    return bffError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await resolveSession();
    if (!session.authenticated || !session.user) {
      return bffSuccess({ message: "Not authenticated." }, 401);
    }

    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const body = (await request.json()) as {
      firstName?: string;
      lastName?: string;
      name?: string;
    };

    const name =
      typeof body.name === "string" && body.name.trim()
        ? body.name.trim()
        : joinDisplayName(body.firstName ?? "", body.lastName ?? "");

    if (!name) {
      return bffSuccess({ message: "Name is required." }, 400);
    }

    const user = await hmisApiRequest<User>(
      AUTH_API_PATHS.userDetail(session.user.id),
      {
        method: "PATCH",
        token: auth.accessToken,
        body: { name },
      },
    );

    return bffSuccess({ user });
  } catch (error) {
    return bffError(error);
  }
}

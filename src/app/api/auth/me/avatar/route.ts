import { AUTH_API_PATHS } from "@/constants/auth-api";
import type { User } from "@/features/auth/types/auth.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { withBrowserAvatar } from "@/lib/server/media-url";
import { requireAccessToken } from "@/lib/server/require-access-token";
import { resolveSession } from "@/lib/server/session";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const session = await resolveSession();
    if (!session.authenticated || !session.user) {
      return bffSuccess({ message: "Not authenticated." }, 401);
    }

    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const formData = await request.formData();
    const avatar = formData.get("avatar");
    if (!(avatar instanceof File) || avatar.size === 0) {
      return bffSuccess({ message: "Choose a profile photo." }, 400);
    }

    if (!avatar.type.startsWith("image/")) {
      return bffSuccess({ message: "Profile photo must be an image." }, 400);
    }

    if (avatar.size > MAX_AVATAR_BYTES) {
      return bffSuccess({ message: "Profile photo must be 5 MB or smaller." }, 400);
    }

    const upload = new FormData();
    upload.set("avatar", avatar, avatar.name);

    const user = await hmisApiRequest<User>(AUTH_API_PATHS.avatar, {
      method: "POST",
      token: auth.accessToken,
      body: upload,
    });

    return bffSuccess({ user: withBrowserAvatar(user) });
  } catch (error) {
    return bffError(error);
  }
}

export async function DELETE() {
  try {
    const session = await resolveSession();
    if (!session.authenticated || !session.user) {
      return bffSuccess({ message: "Not authenticated." }, 401);
    }

    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const user = await hmisApiRequest<User>(AUTH_API_PATHS.avatar, {
      method: "DELETE",
      token: auth.accessToken,
    });

    return bffSuccess({ user: withBrowserAvatar(user) });
  } catch (error) {
    return bffError(error);
  }
}

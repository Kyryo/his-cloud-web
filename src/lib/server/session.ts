import { AUTH_API_PATHS } from "@/constants/auth-api";
import {
  clearAuthCookies,
  getAuthTokensFromCookies,
  isAccessTokenValid,
  setAuthCookies,
} from "@/lib/server/auth-cookies";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import type { User } from "@/features/auth/types/auth.types";

export type SessionState = {
  authenticated: boolean;
  user?: User;
};

export async function resolveSession(): Promise<SessionState> {
  const tokens = await getAuthTokensFromCookies();
  if (!tokens) {
    return { authenticated: false };
  }

  let access = tokens.access;

  if (!isAccessTokenValid(access)) {
    try {
      const refreshed = await hmisApiRequest<{ access: string }>(
        AUTH_API_PATHS.tokenRefresh,
        {
          method: "POST",
          body: { refresh: tokens.refresh },
        },
      );
      access = refreshed.access;
      await setAuthCookies({ access, refresh: tokens.refresh });
    } catch {
      await clearAuthCookies();
      return { authenticated: false };
    }
  }

  try {
    const user = await hmisApiRequest<User>(AUTH_API_PATHS.me, { token: access });
    return { authenticated: true, user };
  } catch {
    await clearAuthCookies();
    return { authenticated: false };
  }
}

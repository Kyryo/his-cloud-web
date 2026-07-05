import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";

import { AUTH_API_PATHS } from "@/constants/auth-api";
import {
  ACCESS_TOKEN_COOKIE,
  AUTH_COOKIE_MAX_AGE_SECONDS,
  REFRESH_TOKEN_COOKIE,
} from "@/constants/session";
import type { AuthTokens, TokenPayload } from "@/features/auth/types/auth.types";
import { hmisApiRequest } from "@/lib/server/hmis-api";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
};

export async function getAuthTokensFromCookies(): Promise<AuthTokens | null> {
  const cookieStore = await cookies();
  const access = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refresh = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!access || !refresh) {
    return null;
  }

  return { access, refresh };
}

export async function setAuthCookies(tokens: AuthTokens): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, tokens.access, cookieOptions);
  cookieStore.set(REFRESH_TOKEN_COOKIE, tokens.refresh, cookieOptions);
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
}

export function isAccessTokenValid(accessToken: string): boolean {
  try {
    const decoded = jwtDecode<TokenPayload>(accessToken);
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
}

export async function getValidAccessToken(): Promise<string | null> {
  const tokens = await getAuthTokensFromCookies();
  if (!tokens) return null;

  if (isAccessTokenValid(tokens.access)) {
    return tokens.access;
  }

  try {
    const refreshed = await hmisApiRequest<{ access: string }>(
      AUTH_API_PATHS.tokenRefresh,
      {
        method: "POST",
        body: { refresh: tokens.refresh },
      },
    );
    await setAuthCookies({ access: refreshed.access, refresh: tokens.refresh });
    return refreshed.access;
  } catch {
    await clearAuthCookies();
    return null;
  }
}

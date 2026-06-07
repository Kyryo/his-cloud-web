import { AUTH_API_PATHS } from "@/constants/auth-api";
import {
  clearAuthCookies,
  getAuthTokensFromCookies,
  getValidAccessToken,
} from "@/lib/server/auth-cookies";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";

export async function POST() {
  try {
    const tokens = await getAuthTokensFromCookies();
    const access = await getValidAccessToken();

    if (tokens) {
      try {
        await hmisApiRequest<{ detail: string }>(AUTH_API_PATHS.logout, {
          method: "POST",
          body: { refresh_token: tokens.refresh },
          token: access ?? undefined,
        });
      } catch {
        // Best-effort remote logout; always clear local cookies.
      }
    }

    await clearAuthCookies();
    return bffSuccess({ ok: true });
  } catch (error) {
    await clearAuthCookies();
    return bffError(error);
  }
}

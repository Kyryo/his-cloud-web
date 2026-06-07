import { AUTH_API_PATHS } from "@/constants/auth-api";
import {
  clearAuthCookies,
  getAuthTokensFromCookies,
  setAuthCookies,
} from "@/lib/server/auth-cookies";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";

export async function POST() {
  try {
    const tokens = await getAuthTokensFromCookies();
    if (!tokens) {
      return bffSuccess({ message: "No active session." }, 401);
    }

    const data = await hmisApiRequest<{ access: string }>(
      AUTH_API_PATHS.tokenRefresh,
      {
        method: "POST",
        body: { refresh: tokens.refresh },
      },
    );

    await setAuthCookies({ access: data.access, refresh: tokens.refresh });

    return bffSuccess({ ok: true });
  } catch (error) {
    await clearAuthCookies();
    return bffError(error);
  }
}

import { getValidAccessToken } from "@/lib/server/auth-cookies";
import { bffSuccess } from "@/lib/server/bff-response";
import { resolveSession } from "@/lib/server/session";

export async function requireAccessToken() {
  const session = await resolveSession();
  if (!session.authenticated) {
    return { error: bffSuccess({ message: "Not authenticated." }, 401) };
  }

  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    return { error: bffSuccess({ message: "Not authenticated." }, 401) };
  }

  return { accessToken };
}

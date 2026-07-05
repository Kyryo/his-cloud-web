import { getValidAccessToken } from "@/lib/server/auth-cookies";
import { bffSuccess } from "@/lib/server/bff-response";

export async function requireAccessToken() {
  const accessToken = await getValidAccessToken();
  if (!accessToken) {
    return { error: bffSuccess({ message: "Not authenticated." }, 401) };
  }

  return { accessToken };
}

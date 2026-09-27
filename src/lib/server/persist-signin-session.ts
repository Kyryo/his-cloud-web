import type { AuthSession } from "@/features/auth/types/auth.types";
import { setAuthCookies } from "@/lib/server/auth-cookies";
import { withBrowserAvatar } from "@/lib/server/media-url";

export async function persistSigninSession(session: AuthSession): Promise<{ user: AuthSession["user"] }> {
  await setAuthCookies(session.tokens);
  return { user: withBrowserAvatar(session.user) };
}

import type { AuthSession } from "@/features/auth/types/auth.types";
import { setAuthCookies } from "@/lib/server/auth-cookies";

export async function persistSigninSession(session: AuthSession): Promise<{ user: AuthSession["user"] }> {
  await setAuthCookies(session.tokens);
  return { user: session.user };
}

import { clearAuthCookies } from "@/lib/server/auth-cookies";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { resolveSession } from "@/lib/server/session";

export async function GET() {
  try {
    const session = await resolveSession();
    return bffSuccess(session);
  } catch (error) {
    return bffError(error);
  }
}

export async function DELETE() {
  try {
    await clearAuthCookies();
    return bffSuccess({ ok: true });
  } catch (error) {
    return bffError(error);
  }
}

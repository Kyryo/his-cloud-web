import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

export async function GET() {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const data = await hmisApiRequest<{
      quick_access?: unknown;
      pinned?: unknown;
    }>("/overview/home/", {
      token: auth.accessToken,
    });

    return bffSuccess({
      quick_access: Array.isArray(data?.quick_access) ? data.quick_access : [],
      pinned: Array.isArray(data?.pinned) ? data.pinned : [],
      generated_at: (data as { generated_at?: string } | null)?.generated_at,
    });
  } catch (error) {
    return bffError(error);
  }
}

import { HMIS_API_URL } from "@/constants/api";
import { NOTIFICATIONS_API_PATHS } from "@/constants/notifications-api";
import { bffError } from "@/lib/server/bff-response";
import { requireAccessToken } from "@/lib/server/require-access-token";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const upstream = await fetch(
      `${HMIS_API_URL}${NOTIFICATIONS_API_PATHS.events}`,
      {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
          Accept: "text/event-stream",
        },
        cache: "no-store",
      },
    );

    if (!upstream.ok || !upstream.body) {
      return bffError(
        new Error("Could not open the notifications stream."),
      );
    }

    return new Response(upstream.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    return bffError(error);
  }
}

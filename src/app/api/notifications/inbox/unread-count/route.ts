import { NOTIFICATIONS_API_PATHS } from "@/constants/notifications-api";
import type { InboxUnreadCountResponse } from "@/features/notifications/types/inbox.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

export async function GET() {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const data = await hmisApiRequest<InboxUnreadCountResponse>(
      NOTIFICATIONS_API_PATHS.unreadCount,
      { token: auth.accessToken },
    );
    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}

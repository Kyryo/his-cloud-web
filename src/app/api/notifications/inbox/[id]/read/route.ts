import { NOTIFICATIONS_API_PATHS } from "@/constants/notifications-api";
import type { InboxItem } from "@/features/notifications/types/inbox.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const item = await hmisApiRequest<InboxItem>(NOTIFICATIONS_API_PATHS.read(id), {
      method: "POST",
      token: auth.accessToken,
    });
    return bffSuccess(item);
  } catch (error) {
    return bffError(error);
  }
}

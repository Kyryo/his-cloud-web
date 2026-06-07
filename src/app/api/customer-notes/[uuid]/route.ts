import { CUSTOMER_NOTES_API_PATHS } from "@/constants/customer-notes-api";
import type { CustomerNote } from "@/features/customers/types/customer-note.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = {
  params: Promise<{ uuid: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const { uuid } = await context.params;
    const body = await request.json();

    const note = await hmisApiRequest<CustomerNote>(
      CUSTOMER_NOTES_API_PATHS.detail(uuid),
      {
        method: "PATCH",
        token: auth.accessToken,
        body,
      },
    );

    return bffSuccess(note);
  } catch (error) {
    return bffError(error);
  }
}

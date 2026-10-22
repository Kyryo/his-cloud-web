import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

export async function PUT(request: Request) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const body = (await request.json()) as { areas?: unknown };
    const data = await hmisApiRequest("/overview/pins/", {
      method: "PUT",
      token: auth.accessToken,
      body: { areas: body.areas ?? [] },
    });

    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}

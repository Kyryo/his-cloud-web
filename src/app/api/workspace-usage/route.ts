import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

export async function GET() {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const data = await hmisApiRequest<unknown>("/workspace-usage/", {
      token: auth.accessToken,
    });

    return bffSuccess(Array.isArray(data) ? data : []);
  } catch (error) {
    return bffError(error);
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const body = (await request.json()) as { area?: unknown };
    const data = await hmisApiRequest("/workspace-usage/", {
      method: "POST",
      token: auth.accessToken,
      body: { area: body.area },
    });

    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}

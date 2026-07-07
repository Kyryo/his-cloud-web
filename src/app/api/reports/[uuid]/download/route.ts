import { downloadReport } from "@/lib/server/reports-bff";
import { bffError } from "@/lib/server/bff-response";
import { requireAccessToken } from "@/lib/server/require-access-token";

type RouteContext = { params: Promise<{ uuid: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }
    const { uuid } = await context.params;
    return downloadReport(uuid, auth.accessToken);
  } catch (error) {
    return bffError(error);
  }
}

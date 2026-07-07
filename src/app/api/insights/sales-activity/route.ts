import { INSIGHTS_API_PATHS } from "@/constants/insights-api";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

const FORWARDED_KEYS = [
  "date_from",
  "date_to",
  "period",
  "clinic_uuid",
  "limit",
] as const;

function buildQuery(request: Request): string {
  const incoming = new URL(request.url).searchParams;
  const params = new URLSearchParams();
  for (const key of FORWARDED_KEYS) {
    const value = incoming.get(key);
    if (value) {
      params.set(key, value);
    }
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function GET(request: Request) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }
    const data = await hmisApiRequest<unknown>(
      `${INSIGHTS_API_PATHS.salesActivity}${buildQuery(request)}`,
      { token: auth.accessToken },
    );
    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}

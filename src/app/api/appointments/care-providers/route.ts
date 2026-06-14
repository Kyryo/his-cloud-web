import { APPOINTMENTS_API_PATHS } from "@/constants/appointments-api";
import type { CareProvider } from "@/features/appointments/types/appointment.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { buildForwardedQuery } from "@/lib/server/inventory-bff-handlers";
import { requireAccessToken } from "@/lib/server/require-access-token";

const QUERY_KEYS = ["search", "clinic"] as const;

export async function GET(request: Request) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const query = buildForwardedQuery(request, QUERY_KEYS);
    const data = await hmisApiRequest<CareProvider[]>(
      `${APPOINTMENTS_API_PATHS.careProviders}${query}`,
      { token: auth.accessToken },
    );

    return bffSuccess({ results: data });
  } catch (error) {
    return bffError(error);
  }
}

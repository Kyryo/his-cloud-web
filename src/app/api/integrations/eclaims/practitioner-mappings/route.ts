import { CLAIMS_API_PATHS } from "@/constants/claims-api";
import type { EClaimPractitionerMapping } from "@/features/claims/types/claims.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest, hmisApiRequestWithMeta } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

const FORWARDED_QUERY_KEYS = ["clinic_id", "mapping_type", "active"] as const;

function buildUpstreamQuery(request: Request): string {
  const incoming = new URL(request.url).searchParams;
  const params = new URLSearchParams();

  for (const key of FORWARDED_QUERY_KEYS) {
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

    const query = buildUpstreamQuery(request);
    const { data, meta } = await hmisApiRequestWithMeta<EClaimPractitionerMapping[]>(
      `${CLAIMS_API_PATHS.practitionerMappings}${query}`,
      { token: auth.accessToken },
    );

    return bffSuccess({
      results: data,
      pagination: meta.pagination ?? null,
    });
  } catch (error) {
    return bffError(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const body = await request.json();
    const mapping = await hmisApiRequest<EClaimPractitionerMapping>(
      CLAIMS_API_PATHS.practitionerMappings,
      {
        method: "POST",
        token: admin.accessToken,
        body,
      },
    );

    return bffSuccess({ mapping }, 201);
  } catch (error) {
    return bffError(error);
  }
}

import { CARE_PROVIDERS_API_PATHS } from "@/constants/care-providers-api";
import type {
  CareProviderRecord,
  CareProvidersListResponse,
} from "@/features/care-providers/types/care-provider.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest, hmisApiRequestWithMeta } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

const FORWARDED_QUERY_KEYS = ["search", "clinic_id", "has_user", "is_active"] as const;

function buildUpstreamQuery(request: Request): string {
  const incoming = new URL(request.url).searchParams;
  const params = new URLSearchParams();

  for (const key of FORWARDED_QUERY_KEYS) {
    const value = incoming.get(key);
    if (value != null && value !== "") {
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
    const { data, meta } = await hmisApiRequestWithMeta<CareProviderRecord[]>(
      `${CARE_PROVIDERS_API_PATHS.list}${query}`,
      { token: auth.accessToken },
    );

    const response: CareProvidersListResponse = {
      count: meta.pagination?.count ?? data.length,
      results: data,
    };

    return bffSuccess(response);
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
    const provider = await hmisApiRequest<CareProviderRecord>(
      CARE_PROVIDERS_API_PATHS.list,
      {
        method: "POST",
        token: admin.accessToken,
        body,
      },
    );

    return bffSuccess(provider, 201);
  } catch (error) {
    return bffError(error);
  }
}

import { CLINICS_API_PATHS } from "@/constants/clinics-api";
import type { OrganizationClinic } from "@/features/settings/types/settings.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequestWithMeta } from "@/lib/server/hmis-api";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

const FORWARDED_QUERY_KEYS = ["page", "page_size", "search", "ordering"] as const;

function buildUpstreamQuery(request: Request): string {
  const incoming = new URL(request.url).searchParams;
  const params = new URLSearchParams();

  for (const key of FORWARDED_QUERY_KEYS) {
    const value = incoming.get(key);
    if (value) {
      params.set(key, value);
    }
  }

  if (!params.has("page_size")) {
    params.set("page_size", "100");
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function GET(request: Request) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const query = buildUpstreamQuery(request);
    const { data, meta } = await hmisApiRequestWithMeta<OrganizationClinic[]>(
      `${CLINICS_API_PATHS.list}${query}`,
      { token: admin.accessToken },
    );

    return bffSuccess({
      results: data,
      pagination: meta.pagination ?? null,
    });
  } catch (error) {
    return bffError(error);
  }
}

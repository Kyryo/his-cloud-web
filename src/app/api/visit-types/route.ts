import { VISIT_TYPES_API_PATHS } from "@/constants/visit-types-api";
import type {
  CreateOrganizationServicePayload,
  OrganizationService,
} from "@/features/settings/types/settings.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest, hmisApiRequestWithMeta } from "@/lib/server/hmis-api";
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
    const { data, meta } = await hmisApiRequestWithMeta<OrganizationService[]>(
      `${VISIT_TYPES_API_PATHS.list}${query}`,
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

export async function POST(request: Request) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const body = (await request.json()) as CreateOrganizationServicePayload;

    if (!body.name?.trim()) {
      return bffSuccess({ message: "Name is required." }, 400);
    }

    const service = await hmisApiRequest<OrganizationService>(
      VISIT_TYPES_API_PATHS.list,
      {
        method: "POST",
        token: admin.accessToken,
        body: {
          name: body.name.trim(),
          code: body.code?.trim() || "",
          description: body.description?.trim() || "",
          is_chargable: body.is_chargable ?? true,
          is_active: body.is_active ?? true,
        },
      },
    );

    return bffSuccess(service, 201);
  } catch (error) {
    return bffError(error);
  }
}

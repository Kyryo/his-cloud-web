import { LOCATIONS_API_PATHS } from "@/constants/locations-api";
import type {
  CreateOrganizationLocationPayload,
  OrganizationLocation,
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
    const { data, meta } = await hmisApiRequestWithMeta<OrganizationLocation[]>(
      `${LOCATIONS_API_PATHS.list}${query}`,
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

    const body = (await request.json()) as CreateOrganizationLocationPayload;

    if (!body.name?.trim() || !body.code?.trim() || !body.clinic || !body.department) {
      return bffSuccess(
        { message: "Name, code, clinic, and department are required." },
        400,
      );
    }

    const location = await hmisApiRequest<OrganizationLocation>(
      LOCATIONS_API_PATHS.list,
      {
        method: "POST",
        token: admin.accessToken,
        body: {
          name: body.name.trim(),
          code: body.code.trim(),
          clinic: body.clinic,
          department: body.department,
          description: body.description?.trim() || "",
          status: body.status ?? "ACTIVE",
          is_active: body.is_active ?? true,
        },
      },
    );

    return bffSuccess(location, 201);
  } catch (error) {
    return bffError(error);
  }
}

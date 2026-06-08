import { USERS_API_PATHS } from "@/constants/users-api";
import type {
  CreateOrganizationUserPayload,
  OrganizationUser,
} from "@/features/settings/types/settings.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest, hmisApiRequestWithMeta } from "@/lib/server/hmis-api";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

const FORWARDED_QUERY_KEYS = ["page", "page_size", "search", "ordering", "location"] as const;

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
    const { data, meta } = await hmisApiRequestWithMeta<OrganizationUser[]>(
      `${USERS_API_PATHS.list}${query}`,
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

    const body = (await request.json()) as CreateOrganizationUserPayload;

    if (!body.name?.trim()) {
      return bffSuccess({ message: "Name is required." }, 400);
    }

    if (!body.email?.trim()) {
      return bffSuccess({ message: "Email is required." }, 400);
    }

    if (!body.password?.trim()) {
      return bffSuccess({ message: "Password is required." }, 400);
    }

    const user = await hmisApiRequest<OrganizationUser>(USERS_API_PATHS.list, {
      method: "POST",
      token: admin.accessToken,
      body: {
        name: body.name.trim(),
        email: body.email.trim(),
        password: body.password,
      },
    });

    return bffSuccess(user, 201);
  } catch (error) {
    return bffError(error);
  }
}

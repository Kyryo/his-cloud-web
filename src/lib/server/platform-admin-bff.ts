import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest, hmisApiRequestWithMeta } from "@/lib/server/hmis-api";
import { requirePlatformAdmin } from "@/lib/server/require-platform-admin";

const DEFAULT_QUERY_KEYS = [
  "page",
  "page_size",
  "search",
  "ordering",
  "status",
  "is_active",
  "country",
  "clinic",
  "department",
  "department_type",
  "is_admin",
  "user_role",
  "action",
  "target_model",
  "date_from",
  "date_to",
  "period",
] as const;

export function buildPlatformAdminQuery(request: Request): string {
  const incoming = new URL(request.url).searchParams;
  const params = new URLSearchParams();

  for (const key of DEFAULT_QUERY_KEYS) {
    const value = incoming.get(key);
    if (value) {
      params.set(key, value);
    }
  }

  if (!params.has("page_size")) {
    params.set("page_size", "50");
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function platformAdminList<T>(request: Request, path: string) {
  try {
    const admin = await requirePlatformAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const { data, meta } = await hmisApiRequestWithMeta<T[]>(
      `${path}${buildPlatformAdminQuery(request)}`,
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

export async function platformAdminGet<T>(path: string) {
  try {
    const admin = await requirePlatformAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    return bffSuccess(
      await hmisApiRequest<T>(path, { token: admin.accessToken }),
    );
  } catch (error) {
    return bffError(error);
  }
}

export async function platformAdminWrite<T>(
  request: Request,
  path: string,
  method: "POST" | "PATCH" | "PUT",
  status = 200,
) {
  try {
    const admin = await requirePlatformAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const body = (await request.json()) as object;
    const data = await hmisApiRequest<T>(path, {
      method,
      token: admin.accessToken,
      body,
    });

    return bffSuccess(data, status);
  } catch (error) {
    return bffError(error);
  }
}

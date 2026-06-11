import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest, hmisApiRequestWithMeta } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

export function buildForwardedQuery(
  request: Request,
  keys: readonly string[],
  defaults?: Record<string, string>,
): string {
  const incoming = new URL(request.url).searchParams;
  const params = new URLSearchParams();

  for (const key of keys) {
    const value = incoming.get(key);
    if (value) {
      params.set(key, value);
    }
  }

  if (defaults) {
    for (const [key, value] of Object.entries(defaults)) {
      if (!params.has(key)) {
        params.set(key, value);
      }
    }
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

type AuthMode = "user" | "admin";

async function resolveAuth(mode: AuthMode) {
  if (mode === "admin") {
    return requireTenantAdmin();
  }
  return requireAccessToken();
}

export async function handleInventoryListGet<T>(
  request: Request,
  upstreamPath: string,
  queryKeys: readonly string[],
  mode: AuthMode = "user",
  defaults?: Record<string, string>,
) {
  try {
    const auth = await resolveAuth(mode);
    if ("error" in auth) {
      return auth.error;
    }

    const query = buildForwardedQuery(request, queryKeys, defaults);
    const { data, meta } = await hmisApiRequestWithMeta<T[]>(
      `${upstreamPath}${query}`,
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

export async function handleInventoryDetailGet<T>(
  upstreamPath: string,
  mode: AuthMode = "user",
) {
  try {
    const auth = await resolveAuth(mode);
    if ("error" in auth) {
      return auth.error;
    }

    const data = await hmisApiRequest<T>(upstreamPath, {
      token: auth.accessToken,
    });

    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}

export async function handleInventoryCreate<T>(
  request: Request,
  upstreamPath: string,
  mode: AuthMode = "user",
) {
  try {
    const auth = await resolveAuth(mode);
    if ("error" in auth) {
      return auth.error;
    }

    const body = await request.json();
    const data = await hmisApiRequest<T>(upstreamPath, {
      method: "POST",
      token: auth.accessToken,
      body,
    });

    return bffSuccess(data, 201);
  } catch (error) {
    return bffError(error);
  }
}

export async function handleInventoryUpdate<T>(
  request: Request,
  upstreamPath: string,
  method: "PUT" | "PATCH",
  mode: AuthMode = "user",
) {
  try {
    const auth = await resolveAuth(mode);
    if ("error" in auth) {
      return auth.error;
    }

    const body = await request.json();
    const data = await hmisApiRequest<T>(upstreamPath, {
      method,
      token: auth.accessToken,
      body,
    });

    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}

export async function handleInventoryDelete(
  upstreamPath: string,
  mode: AuthMode = "user",
) {
  try {
    const auth = await resolveAuth(mode);
    if ("error" in auth) {
      return auth.error;
    }

    await hmisApiRequest(upstreamPath, {
      method: "DELETE",
      token: auth.accessToken,
    });

    return bffSuccess(null, 204);
  } catch (error) {
    return bffError(error);
  }
}

export async function handleInventoryAction<T>(
  upstreamPath: string,
  mode: AuthMode = "user",
) {
  try {
    const auth = await resolveAuth(mode);
    if ("error" in auth) {
      return auth.error;
    }

    const data = await hmisApiRequest<T>(upstreamPath, {
      method: "POST",
      token: auth.accessToken,
    });

    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}

export async function handleInventorySearchGet<T>(
  request: Request,
  upstreamPath: string,
  queryKeys: readonly string[],
) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const query = buildForwardedQuery(request, queryKeys);
    const data = await hmisApiRequest<T>(`${upstreamPath}${query}`, {
      token: auth.accessToken,
    });

    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}

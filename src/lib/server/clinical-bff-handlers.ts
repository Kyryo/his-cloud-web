import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { HmisApiError } from "@/lib/server/hmis-api";
import { hmisApiRequest, hmisApiRequestWithMeta } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";
import { buildForwardedQuery } from "@/lib/server/inventory-bff-handlers";

type AuthMode = "user" | "admin";

async function resolveAuth(mode: AuthMode) {
  if (mode === "admin") {
    return requireTenantAdmin();
  }
  return requireAccessToken();
}

export async function handleClinicalListGet<T>(
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

export async function handleClinicalDetailGet<T>(
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

export async function handleClinicalCreate<T>(
  request: Request,
  upstreamPath: string,
  mode: AuthMode = "user",
  logLabel?: string,
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
    console.error(
      `[clinical-bff] ${logLabel ?? "create"} failed path=${upstreamPath}`,
      error instanceof HmisApiError
        ? {
            status: error.status,
            message: error.message,
            errors: error.errors,
          }
        : error,
    );
    return bffError(error);
  }
}

export async function handleClinicalPatch<T>(
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
      method: "PATCH",
      token: auth.accessToken,
      body,
    });

    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}

export async function handleClinicalAction<T>(
  upstreamPath: string,
  mode: AuthMode = "user",
  body?: unknown,
) {
  try {
    const auth = await resolveAuth(mode);
    if ("error" in auth) {
      return auth.error;
    }

    const data = await hmisApiRequest<T>(upstreamPath, {
      method: "POST",
      token: auth.accessToken,
      body: body ?? {},
    });

    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}

import { bffError, bffNoContent, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest, hmisApiRequestWithMeta } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";

const LIST_QUERY_KEYS = ["page", "page_size"] as const;

function buildQuery(
  request: Request,
  extraKeys: readonly string[] = [],
): string {
  const incoming = new URL(request.url).searchParams;
  const params = new URLSearchParams();
  for (const key of [...LIST_QUERY_KEYS, ...extraKeys]) {
    const value = incoming.get(key);
    if (value) {
      params.set(key, value);
    }
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function createLaboratoryCatalogListHandlers(
  collectionPath: string,
  extraQueryKeys: readonly string[] = [],
) {
  return {
    async GET(request: Request) {
      try {
        const auth = await requireAccessToken();
        if ("error" in auth) {
          return auth.error;
        }

        const query = buildQuery(request, extraQueryKeys);
        const { data, meta } = await hmisApiRequestWithMeta<unknown[]>(
          `${collectionPath}${query}`,
          { token: auth.accessToken },
        );

        return bffSuccess({
          results: data,
          pagination: meta.pagination ?? null,
        });
      } catch (error) {
        return bffError(error);
      }
    },

    async POST(request: Request) {
      try {
        const auth = await requireAccessToken();
        if ("error" in auth) {
          return auth.error;
        }

        const body = await request.json();
        const data = await hmisApiRequest<unknown>(collectionPath, {
          method: "POST",
          token: auth.accessToken,
          body,
        });

        return bffSuccess(data, 201);
      } catch (error) {
        return bffError(error);
      }
    },
  };
}

export function createLaboratoryCatalogDetailHandlers(
  detailPath: (uuid: string) => string,
) {
  return {
    async GET(_request: Request, context: { params: Promise<{ uuid: string }> }) {
      try {
        const auth = await requireAccessToken();
        if ("error" in auth) {
          return auth.error;
        }

        const { uuid } = await context.params;
        const data = await hmisApiRequest<unknown>(detailPath(uuid), {
          token: auth.accessToken,
        });

        return bffSuccess(data);
      } catch (error) {
        return bffError(error);
      }
    },

    async PATCH(request: Request, context: { params: Promise<{ uuid: string }> }) {
      try {
        const auth = await requireAccessToken();
        if ("error" in auth) {
          return auth.error;
        }

        const { uuid } = await context.params;
        const body = await request.json();
        const data = await hmisApiRequest<unknown>(detailPath(uuid), {
          method: "PATCH",
          token: auth.accessToken,
          body,
        });

        return bffSuccess(data);
      } catch (error) {
        return bffError(error);
      }
    },

    async DELETE(
      _request: Request,
      context: { params: Promise<{ uuid: string }> },
    ) {
      try {
        const auth = await requireAccessToken();
        if ("error" in auth) {
          return auth.error;
        }

        const { uuid } = await context.params;
        await hmisApiRequest<null>(detailPath(uuid), {
          method: "DELETE",
          token: auth.accessToken,
        });

        return bffNoContent();
      } catch (error) {
        return bffError(error);
      }
    },
  };
}

export async function getLaboratorySettingsHandler(settingsPath: string) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const data = await hmisApiRequest<unknown>(settingsPath, {
      token: auth.accessToken,
    });

    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}

export async function putLaboratorySettingsHandler(
  request: Request,
  settingsPath: string,
) {
  try {
    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const body = await request.json();
    const data = await hmisApiRequest<unknown>(settingsPath, {
      method: "PUT",
      token: auth.accessToken,
      body,
    });

    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}

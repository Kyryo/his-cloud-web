import { INSURANCE_API_PATHS } from "@/constants/insurance-api";
import type { OrganizationPayerScheme } from "@/features/settings/types/settings.types";
import type { CreateOrganizationPayerSchemePayload } from "@/features/settings/types/settings.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest, hmisApiRequestWithMeta } from "@/lib/server/hmis-api";
import { requireAccessToken } from "@/lib/server/require-access-token";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

const FORWARDED_QUERY_KEYS = ["page", "page_size", "search", "ordering", "is_active"] as const;

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
    const query = buildUpstreamQuery(request);
    const isOrganizationScope =
      new URL(request.url).searchParams.get("scope") === "organization";

    if (isOrganizationScope) {
      const admin = await requireTenantAdmin();
      if ("error" in admin) {
        return admin.error;
      }

      const params = new URLSearchParams(query.replace(/^\?/, ""));
      if (!params.has("page_size")) {
        params.set("page_size", "100");
      }

      const organizationQuery = params.toString();
      const { data, meta } = await hmisApiRequestWithMeta<OrganizationPayerScheme[]>(
        `${INSURANCE_API_PATHS.schemes}${organizationQuery ? `?${organizationQuery}` : ""}`,
        { token: admin.accessToken },
      );

      return bffSuccess({
        results: data,
        pagination: meta.pagination ?? null,
      });
    }

    const auth = await requireAccessToken();
    if ("error" in auth) {
      return auth.error;
    }

    const activeQuery = query || "?is_active=true&page_size=500";
    const { data, meta } = await hmisApiRequestWithMeta<OrganizationPayerScheme[]>(
      `${INSURANCE_API_PATHS.schemes}${activeQuery.startsWith("?") ? activeQuery : `?${activeQuery}`}`,
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

    const body = (await request.json()) as CreateOrganizationPayerSchemePayload;

    if (!body.name?.trim() || !body.code?.trim() || !body.insurance_company) {
      return bffSuccess(
        { message: "Payer, name, and code are required." },
        400,
      );
    }

    const scheme = await hmisApiRequest<OrganizationPayerScheme>(
      INSURANCE_API_PATHS.schemes,
      {
        method: "POST",
        token: admin.accessToken,
        body: {
          insurance_company: body.insurance_company,
          name: body.name.trim(),
          code: body.code.trim(),
          description: body.description?.trim() || "",
          pricelist_id: body.pricelist_id ?? null,
          is_active: body.is_active ?? true,
        },
      },
    );

    return bffSuccess(scheme, 201);
  } catch (error) {
    return bffError(error);
  }
}

import { PRICELISTS_API_PATHS } from "@/constants/pricelists-api";
import type {
  CreateOrganizationPricelistPayload,
  OrganizationPricelist,
} from "@/features/settings/types/settings.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";
import type { PaginatedListResponse } from "@/types/api.types";

export async function GET(request: Request) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const url = new URL(request.url);
    const params = new URLSearchParams();
    if (url.searchParams.get("include_inactive") === "true") {
      params.set("include_inactive", "true");
    }
    if (!params.has("page_size")) {
      params.set("page_size", "200");
    }
    const query = params.toString();

    const response = await hmisApiRequest<PaginatedListResponse<OrganizationPricelist>>(
      `${PRICELISTS_API_PATHS.list}${query ? `?${query}` : ""}`,
      { token: admin.accessToken },
    );

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

    const body = (await request.json()) as CreateOrganizationPricelistPayload;

    if (!body.name?.trim()) {
      return bffSuccess({ message: "Name is required." }, 400);
    }

    const pricelist = await hmisApiRequest<OrganizationPricelist>(
      PRICELISTS_API_PATHS.list,
      {
        method: "POST",
        token: admin.accessToken,
        body: {
          name: body.name.trim(),
          is_active: body.is_active ?? true,
          ...(body.currency_code ? { currency_code: body.currency_code } : {}),
        },
      },
    );

    return bffSuccess(pricelist, 201);
  } catch (error) {
    return bffError(error);
  }
}

import { PRICELISTS_API_PATHS } from "@/constants/pricelists-api";
import type {
  CreateOrganizationPricelistPayload,
  OrganizationPricelist,
} from "@/features/settings/types/settings.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

export async function GET(request: Request) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const includeInactive =
      new URL(request.url).searchParams.get("include_inactive") === "true";
    const query = includeInactive ? "?include_inactive=true" : "";

    const pricelists = await hmisApiRequest<OrganizationPricelist[]>(
      `${PRICELISTS_API_PATHS.list}${query}`,
      { token: admin.accessToken },
    );

    return bffSuccess({
      results: pricelists,
      pagination: null,
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
          active: body.active ?? true,
        },
      },
    );

    return bffSuccess(pricelist, 201);
  } catch (error) {
    return bffError(error);
  }
}

import { PRICELISTS_API_PATHS } from "@/constants/pricelists-api";
import type {
  OrganizationDefaultPricelist,
  SetOrganizationDefaultPricelistPayload,
} from "@/features/settings/types/settings.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

export async function GET() {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const defaultPricelist = await hmisApiRequest<OrganizationDefaultPricelist>(
      PRICELISTS_API_PATHS.tenantDefault(admin.tenantUuid),
      { token: admin.accessToken },
    );

    return bffSuccess(defaultPricelist);
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

    const body = (await request.json()) as SetOrganizationDefaultPricelistPayload;

    const defaultPricelist = await hmisApiRequest<OrganizationDefaultPricelist>(
      PRICELISTS_API_PATHS.tenantDefault(admin.tenantUuid),
      {
        method: "POST",
        token: admin.accessToken,
        body: {
          default_pricelist_uuid: body.default_pricelist_uuid ?? null,
        },
      },
    );

    return bffSuccess(defaultPricelist);
  } catch (error) {
    return bffError(error);
  }
}

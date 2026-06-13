import { PRICELISTS_API_PATHS } from "@/constants/pricelists-api";
import type {
  OrganizationPricelist,
  UpdateOrganizationPricelistPayload,
} from "@/features/settings/types/settings.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const { id } = await context.params;
    const body = (await request.json()) as UpdateOrganizationPricelistPayload;

    if (!body.name?.trim() && body.active === undefined) {
      return bffSuccess({ message: "At least one field is required." }, 400);
    }

    const pricelist = await hmisApiRequest<OrganizationPricelist>(
      PRICELISTS_API_PATHS.detail(id),
      {
        method: "PATCH",
        token: admin.accessToken,
        body: {
          ...(body.name?.trim() ? { name: body.name.trim() } : {}),
          ...(body.active !== undefined ? { active: body.active } : {}),
        },
      },
    );

    return bffSuccess(pricelist);
  } catch (error) {
    return bffError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const { id } = await context.params;

    await hmisApiRequest(PRICELISTS_API_PATHS.detail(id), {
      method: "DELETE",
      token: admin.accessToken,
    });

    return bffSuccess(null, 204);
  } catch (error) {
    return bffError(error);
  }
}

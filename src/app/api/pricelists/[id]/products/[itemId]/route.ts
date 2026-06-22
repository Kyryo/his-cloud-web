import { PRICELISTS_API_PATHS } from "@/constants/pricelists-api";
import type { PricelistProductMutationResult } from "@/features/inventory/types/inventory.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

type RouteContext = {
  params: Promise<{ id: string; itemId: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const { id, itemId } = await context.params;

    const result = await hmisApiRequest<PricelistProductMutationResult>(
      PRICELISTS_API_PATHS.productDetail(id, itemId),
      {
        method: "DELETE",
        token: admin.accessToken,
      },
    );

    return bffSuccess(result);
  } catch (error) {
    return bffError(error);
  }
}

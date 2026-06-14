import { PRICELISTS_API_PATHS } from "@/constants/pricelists-api";
import type { PricelistProductMutationResult } from "@/features/inventory/types/inventory.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const admin = await requireTenantAdmin();
    if ("error" in admin) {
      return admin.error;
    }

    const { id } = await context.params;
    const body = await request.json();

    const result = await hmisApiRequest<PricelistProductMutationResult>(
      PRICELISTS_API_PATHS.addProduct(id),
      {
        method: "POST",
        token: admin.accessToken,
        body,
      },
    );

    return bffSuccess(result, 201);
  } catch (error) {
    return bffError(error);
  }
}

import { PRICELISTS_API_PATHS } from "@/constants/pricelists-api";
import type { CatalogMasmCorePriceSyncResult } from "@/features/catalog/types/catalog.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequest } from "@/lib/server/hmis-api";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

type RouteContext = { params: Promise<{ pricelistUuid: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const auth = await requireTenantAdmin();
    if ("error" in auth) {
      return auth.error;
    }
    const { pricelistUuid } = await context.params;
    let body: Record<string, unknown> = {};
    try {
      const parsed: unknown = await request.json();
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        body = parsed as Record<string, unknown>;
      }
    } catch {
      body = {};
    }
    const data = await hmisApiRequest<CatalogMasmCorePriceSyncResult>(
      PRICELISTS_API_PATHS.syncMasmCorePrices(pricelistUuid),
      {
        method: "POST",
        token: auth.accessToken,
        body,
        timeoutMs: 210_000,
      },
    );
    return bffSuccess(data);
  } catch (error) {
    return bffError(error);
  }
}

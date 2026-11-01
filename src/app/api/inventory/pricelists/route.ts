import { PRICELISTS_API_PATHS } from "@/constants/pricelists-api";
import type { CatalogPricelist } from "@/features/catalog/types/catalog.types";
import { bffError, bffSuccess } from "@/lib/server/bff-response";
import { hmisApiRequestWithMeta } from "@/lib/server/hmis-api";
import {
  buildForwardedQuery,
  handleInventoryCreate,
} from "@/lib/server/inventory-bff-handlers";
import { absoluteMediaUrl } from "@/lib/server/media-url";
import { requireTenantAdmin } from "@/lib/server/require-tenant-admin";

const QUERY_KEYS = ["page", "page_size", "q", "include_inactive", "currency_code"] as const;

function withBrowserCreatorAvatar(pricelist: CatalogPricelist): CatalogPricelist {
  const avatarUrl = pricelist.created_by_avatar_url;
  if (!avatarUrl?.startsWith("/media/")) {
    return pricelist;
  }
  return {
    ...pricelist,
    created_by_avatar_url: absoluteMediaUrl(avatarUrl),
  };
}

export async function GET(request: Request) {
  try {
    const auth = await requireTenantAdmin();
    if ("error" in auth) {
      return auth.error;
    }

    const query = buildForwardedQuery(request, QUERY_KEYS);
    const { data, meta } = await hmisApiRequestWithMeta<CatalogPricelist[]>(
      `${PRICELISTS_API_PATHS.list}${query}`,
      { token: auth.accessToken },
    );

    return bffSuccess({
      results: data.map(withBrowserCreatorAvatar),
      pagination: meta.pagination ?? null,
    });
  } catch (error) {
    return bffError(error);
  }
}

export async function POST(request: Request) {
  return handleInventoryCreate(request, PRICELISTS_API_PATHS.list, "admin");
}

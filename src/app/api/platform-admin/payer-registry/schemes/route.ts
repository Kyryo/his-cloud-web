import { PLATFORM_ADMIN_API_PATHS } from "@/constants/platform-admin-api";
import type { RegistryPayerSchemeCatalogItem } from "@/features/settings/types/settings.types";
import { platformAdminList } from "@/lib/server/platform-admin-bff";

export async function GET(request: Request) {
  return platformAdminList<RegistryPayerSchemeCatalogItem>(
    request,
    PLATFORM_ADMIN_API_PATHS.payerRegistrySchemesCatalog,
  );
}

import { BFF_VISITS_ROUTES } from "@/constants/api";
import type { VisitTypeCatalogItem } from "@/features/customers/types/customer-visit.types";
import { bffRequest } from "@/lib/bff-client";

export async function fetchVisitTypeCatalog(): Promise<VisitTypeCatalogItem[]> {
  const data = await bffRequest<{ results: VisitTypeCatalogItem[] }>(
    BFF_VISITS_ROUTES.visitTypesCatalog,
  );

  return data.results;
}

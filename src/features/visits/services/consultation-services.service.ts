import { BFF_CLINICAL_ROUTES, BFF_VISITS_ROUTES } from "@/constants/api";
import type { ConsultationServiceCatalogItem } from "@/features/visits/types/visit.types";
import { bffRequest } from "@/lib/bff-client";

export async function fetchConsultationServiceCatalog(): Promise<
  ConsultationServiceCatalogItem[]
> {
  const data = await bffRequest<{ results: ConsultationServiceCatalogItem[] }>(
    BFF_VISITS_ROUTES.consultationServicesCatalog,
  );

  return data.results;
}

export async function fetchDepartmentConsultationServices(
  departmentUuid: string,
): Promise<ConsultationServiceCatalogItem[]> {
  const data = await bffRequest<{ results: ConsultationServiceCatalogItem[] }>(
    BFF_CLINICAL_ROUTES.departmentConsultationServices(departmentUuid),
  );

  return data.results;
}

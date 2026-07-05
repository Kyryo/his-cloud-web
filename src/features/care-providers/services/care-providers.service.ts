import { BFF_CARE_PROVIDERS_ROUTES } from "@/constants/api";
import type {
  CareProviderRecord,
  CareProvidersListResponse,
  CreateCareProviderPayload,
  FetchCareProvidersOptions,
  UpdateCareProviderPayload,
} from "@/features/care-providers/types/care-provider.types";
import { bffRequest } from "@/lib/bff-client";

function buildCareProvidersQuery(options: FetchCareProvidersOptions = {}): string {
  const params = new URLSearchParams();

  if (options.search?.trim()) {
    params.set("search", options.search.trim());
  }

  if (options.clinicId != null) {
    params.set("clinic_id", String(options.clinicId));
  }

  if (options.hasUser != null) {
    params.set("has_user", String(options.hasUser));
  }

  if (options.isActive != null) {
    params.set("is_active", String(options.isActive));
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchCareProviderRecords(
  options?: FetchCareProvidersOptions,
): Promise<CareProvidersListResponse> {
  const response = await bffRequest<CareProvidersListResponse>(
    `${BFF_CARE_PROVIDERS_ROUTES.list}${buildCareProvidersQuery(options)}`,
  );

  return {
    count: response.count ?? response.results?.length ?? 0,
    results: response.results ?? [],
  };
}

export async function createCareProvider(
  payload: CreateCareProviderPayload,
): Promise<CareProviderRecord> {
  return bffRequest<CareProviderRecord>(BFF_CARE_PROVIDERS_ROUTES.list, {
    method: "POST",
    body: payload,
  });
}

export async function updateCareProvider(
  uuid: string,
  payload: UpdateCareProviderPayload,
): Promise<CareProviderRecord> {
  return bffRequest<CareProviderRecord>(BFF_CARE_PROVIDERS_ROUTES.detail(uuid), {
    method: "PATCH",
    body: payload,
  });
}

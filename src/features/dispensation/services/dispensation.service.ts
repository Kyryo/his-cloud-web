import { BFF_DISPENSATION_ROUTES } from "@/constants/api";
import type {
  Dispensation,
  DispenseBatchPayload,
  DispenseBatchResponse,
  DispensationConfiguration,
  DispensationListResponse,
  DispensationQueueDetail,
  DispensationQueueListResponse,
  DispensePayload,
} from "@/features/dispensation/types/dispensation.types";
import { bffRequest } from "@/lib/bff-client";

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") {
      continue;
    }
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function fetchDispensationQueue(filters: {
  page?: number;
  page_size?: number;
  search?: string;
}): Promise<DispensationQueueListResponse> {
  return bffRequest<DispensationQueueListResponse>(
    `${BFF_DISPENSATION_ROUTES.queue.list}${buildQuery(filters)}`,
  );
}

export async function fetchDispensationQueueDetail(
  salesOrderUuid: string,
): Promise<DispensationQueueDetail> {
  return bffRequest<DispensationQueueDetail>(
    BFF_DISPENSATION_ROUTES.queue.detail(salesOrderUuid),
  );
}

export async function fetchDispensations(filters: {
  page?: number;
  page_size?: number;
  search?: string;
  sales_order?: number | string;
  location?: number | string;
}): Promise<DispensationListResponse> {
  return bffRequest<DispensationListResponse>(
    `${BFF_DISPENSATION_ROUTES.list}${buildQuery(filters)}`,
  );
}

export async function createDispensation(
  payload: DispensePayload,
): Promise<Dispensation> {
  return bffRequest<Dispensation>(BFF_DISPENSATION_ROUTES.list, {
    method: "POST",
    body: payload,
  });
}

export async function createDispensationsBatch(
  payload: DispenseBatchPayload,
): Promise<DispenseBatchResponse> {
  return bffRequest<DispenseBatchResponse>(BFF_DISPENSATION_ROUTES.batch, {
    method: "POST",
    body: payload,
  });
}

export async function fetchDispensationConfigurationForClinic(
  clinicId: number,
): Promise<DispensationConfiguration> {
  return bffRequest<DispensationConfiguration>(
    BFF_DISPENSATION_ROUTES.configurations.forClinic(clinicId),
  );
}

export async function updateDispensationConfiguration(
  uuid: string,
  payload: Partial<
    Pick<
      DispensationConfiguration,
      | "dispensation_start_state"
      | "require_sales_order_confirmation"
      | "invoice_after_dispensation"
    >
  >,
): Promise<DispensationConfiguration> {
  return bffRequest<DispensationConfiguration>(
    BFF_DISPENSATION_ROUTES.configurations.detail(uuid),
    {
      method: "PATCH",
      body: payload,
    },
  );
}

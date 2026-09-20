import { BFF_LABORATORY_ROUTES } from "@/constants/api";
import type {
  AccessionOrderPayload,
  CollectSpecimenPayload,
  LabAccession,
  LabOrder,
  LabOrderListFilters,
  LabOrdersListResponse,
  LabReport,
  LabResult,
  LabSpecimen,
  RejectLabResultPayload,
  RejectSpecimenPayload,
  UpsertLabResultPayload,
} from "@/features/laboratory/types/laboratory.types";
import { bffRequest } from "@/lib/bff-client";

function buildOrdersQuery(filters: LabOrderListFilters = {}): string {
  const params = new URLSearchParams();

  if (filters.page) {
    params.set("page", String(filters.page));
  }
  if (filters.pageSize) {
    params.set("page_size", String(filters.pageSize));
  }
  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }
  if (filters.priority && filters.priority !== "all") {
    params.set("priority", filters.priority);
  }
  if (filters.clinic?.trim()) {
    params.set("clinic", filters.clinic.trim());
  }
  if (filters.patient?.trim()) {
    params.set("patient", filters.patient.trim());
  }
  if (filters.dateFrom?.trim()) {
    params.set("date_from", filters.dateFrom.trim());
  }
  if (filters.dateTo?.trim()) {
    params.set("date_to", filters.dateTo.trim());
  }
  if (filters.accession?.trim()) {
    params.set("accession", filters.accession.trim());
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function fetchLabOrders(
  filters: LabOrderListFilters = {},
): Promise<LabOrdersListResponse> {
  return bffRequest<LabOrdersListResponse>(
    `${BFF_LABORATORY_ROUTES.orders}${buildOrdersQuery(filters)}`,
  );
}

export async function fetchLabOrder(uuid: string): Promise<LabOrder> {
  return bffRequest<LabOrder>(BFF_LABORATORY_ROUTES.order(uuid));
}

export async function cancelLabOrder(uuid: string): Promise<LabOrder> {
  return bffRequest<LabOrder>(BFF_LABORATORY_ROUTES.cancel(uuid), {
    method: "POST",
  });
}

export async function collectLabSpecimen(
  orderUuid: string,
  payload: CollectSpecimenPayload,
): Promise<LabSpecimen> {
  return bffRequest<LabSpecimen>(BFF_LABORATORY_ROUTES.specimens(orderUuid), {
    method: "POST",
    body: payload,
  });
}

export async function accessionLabOrder(
  orderUuid: string,
  payload: AccessionOrderPayload = {},
): Promise<LabAccession> {
  return bffRequest<LabAccession>(BFF_LABORATORY_ROUTES.accession(orderUuid), {
    method: "POST",
    body: payload,
  });
}

export async function fetchLabOrderReport(uuid: string): Promise<LabReport> {
  return bffRequest<LabReport>(BFF_LABORATORY_ROUTES.report(uuid));
}

export async function fetchLabOrderItemResults(
  itemUuid: string,
): Promise<LabResult> {
  return bffRequest<LabResult>(BFF_LABORATORY_ROUTES.orderItemResults(itemUuid));
}

export async function upsertLabOrderItemResults(
  itemUuid: string,
  payload: UpsertLabResultPayload,
): Promise<LabResult> {
  return bffRequest<LabResult>(BFF_LABORATORY_ROUTES.orderItemResults(itemUuid), {
    method: "PUT",
    body: payload,
  });
}

export async function verifyLabOrderItemResults(
  itemUuid: string,
): Promise<LabResult> {
  return bffRequest<LabResult>(BFF_LABORATORY_ROUTES.verify(itemUuid), {
    method: "POST",
  });
}

export async function releaseLabOrderItemResults(
  itemUuid: string,
): Promise<LabResult> {
  return bffRequest<LabResult>(BFF_LABORATORY_ROUTES.release(itemUuid), {
    method: "POST",
  });
}

export async function rejectLabOrderItemResults(
  itemUuid: string,
  payload: RejectLabResultPayload,
): Promise<LabResult> {
  return bffRequest<LabResult>(BFF_LABORATORY_ROUTES.reject(itemUuid), {
    method: "POST",
    body: payload,
  });
}

export async function rejectLabSpecimen(
  specimenUuid: string,
  payload: RejectSpecimenPayload,
): Promise<LabSpecimen> {
  return bffRequest<LabSpecimen>(
    BFF_LABORATORY_ROUTES.specimenReject(specimenUuid),
    {
      method: "POST",
      body: payload,
    },
  );
}

export async function fetchLabWorklist<T = unknown>(
  queue: string,
  options: { page?: number; pageSize?: number } = {},
): Promise<{ results: T[]; pagination: LabOrdersListResponse["pagination"] }> {
  const params = new URLSearchParams();
  if (options.page) {
    params.set("page", String(options.page));
  }
  if (options.pageSize) {
    params.set("page_size", String(options.pageSize));
  }
  const query = params.toString();
  const suffix = query ? `?${query}` : "";
  return bffRequest(`${BFF_LABORATORY_ROUTES.worklist(queue)}${suffix}`);
}

export {
  fetchLabSpecimenTypes,
} from "@/features/laboratory/services/laboratory-catalog.service";

export async function downloadLabOrderReportPdf(uuid: string): Promise<void> {
  const response = await fetch(BFF_LABORATORY_ROUTES.reportPdf(uuid), {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Could not download the laboratory report PDF.");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `lab-report-${uuid}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

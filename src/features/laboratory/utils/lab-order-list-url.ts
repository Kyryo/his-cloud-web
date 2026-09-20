import { ROUTES } from "@/constants/routes";
import type {
  LabOrderListFilters,
  LabOrderPriority,
  LabOrderStatus,
} from "@/features/laboratory/types/laboratory.types";

export const LAB_ORDER_PAGE_PARAM = "page";
export const LAB_ORDER_STATUS_PARAM = "status";
export const LAB_ORDER_PRIORITY_PARAM = "priority";
export const LAB_ORDER_CLINIC_PARAM = "clinic";
export const LAB_ORDER_PATIENT_PARAM = "patient";
export const LAB_ORDER_DATE_FROM_PARAM = "date_from";
export const LAB_ORDER_DATE_TO_PARAM = "date_to";
export const LAB_ORDER_ACCESSION_PARAM = "accession";

export const LAB_ORDER_STATUSES: LabOrderStatus[] = [
  "ORDERED",
  "COLLECTING",
  "IN_LAB",
  "PARTIAL",
  "COMPLETED",
  "CANCELLED",
];

export const LAB_ORDER_PRIORITIES: LabOrderPriority[] = [
  "ROUTINE",
  "URGENT",
  "STAT",
];

export function parseLabOrderPage(value: string | null | undefined): number {
  const page = Number(value);
  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }
  return page;
}

export function parseLabOrderStatus(
  value: string | null | undefined,
): LabOrderStatus | "all" {
  if (value && LAB_ORDER_STATUSES.includes(value as LabOrderStatus)) {
    return value as LabOrderStatus;
  }
  return "all";
}

export function parseLabOrderPriority(
  value: string | null | undefined,
): LabOrderPriority | "all" {
  if (value && LAB_ORDER_PRIORITIES.includes(value as LabOrderPriority)) {
    return value as LabOrderPriority;
  }
  return "all";
}

export type LabOrderListUrlState = {
  page?: number;
  status?: LabOrderStatus | "all";
  priority?: LabOrderPriority | "all";
  clinic?: string;
  patient?: string;
  dateFrom?: string;
  dateTo?: string;
  accession?: string;
};

export function labOrdersHref({
  page = 1,
  status = "all",
  priority = "all",
  clinic = "",
  patient = "",
  dateFrom = "",
  dateTo = "",
  accession = "",
}: LabOrderListUrlState = {}): string {
  const params = new URLSearchParams();
  if (page > 1) {
    params.set(LAB_ORDER_PAGE_PARAM, String(page));
  }
  if (status !== "all") {
    params.set(LAB_ORDER_STATUS_PARAM, status);
  }
  if (priority !== "all") {
    params.set(LAB_ORDER_PRIORITY_PARAM, priority);
  }
  const trimmedClinic = clinic.trim();
  if (trimmedClinic) {
    params.set(LAB_ORDER_CLINIC_PARAM, trimmedClinic);
  }
  const trimmedPatient = patient.trim();
  if (trimmedPatient) {
    params.set(LAB_ORDER_PATIENT_PARAM, trimmedPatient);
  }
  const trimmedDateFrom = dateFrom.trim();
  if (trimmedDateFrom) {
    params.set(LAB_ORDER_DATE_FROM_PARAM, trimmedDateFrom);
  }
  const trimmedDateTo = dateTo.trim();
  if (trimmedDateTo) {
    params.set(LAB_ORDER_DATE_TO_PARAM, trimmedDateTo);
  }
  const trimmedAccession = accession.trim();
  if (trimmedAccession) {
    params.set(LAB_ORDER_ACCESSION_PARAM, trimmedAccession);
  }
  const query = params.toString();
  return query ? `${ROUTES.labOrders}?${query}` : ROUTES.labOrders;
}

export function filtersFromLabOrderSearchParams(
  searchParams: URLSearchParams,
): LabOrderListUrlState {
  return {
    page: parseLabOrderPage(searchParams.get(LAB_ORDER_PAGE_PARAM)),
    status: parseLabOrderStatus(searchParams.get(LAB_ORDER_STATUS_PARAM)),
    priority: parseLabOrderPriority(searchParams.get(LAB_ORDER_PRIORITY_PARAM)),
    clinic: searchParams.get(LAB_ORDER_CLINIC_PARAM) ?? "",
    patient: searchParams.get(LAB_ORDER_PATIENT_PARAM) ?? "",
    dateFrom: searchParams.get(LAB_ORDER_DATE_FROM_PARAM) ?? "",
    dateTo: searchParams.get(LAB_ORDER_DATE_TO_PARAM) ?? "",
    accession: searchParams.get(LAB_ORDER_ACCESSION_PARAM) ?? "",
  };
}

export function buildLabOrderListFilters(
  state: LabOrderListUrlState & { pageSize?: number },
): LabOrderListFilters {
  return {
    page: state.page ?? 1,
    pageSize: state.pageSize,
    status: state.status ?? "all",
    priority: state.priority ?? "all",
    clinic: state.clinic?.trim() || undefined,
    patient: state.patient?.trim() || undefined,
    dateFrom: state.dateFrom?.trim() || undefined,
    dateTo: state.dateTo?.trim() || undefined,
    accession: state.accession?.trim() || undefined,
  };
}

export function countActiveLabOrderFilters(
  state: LabOrderListUrlState,
): number {
  let count = 0;
  if (state.status && state.status !== "all") count += 1;
  if (state.priority && state.priority !== "all") count += 1;
  if (state.clinic?.trim()) count += 1;
  if (state.patient?.trim()) count += 1;
  if (state.dateFrom?.trim()) count += 1;
  if (state.dateTo?.trim()) count += 1;
  if (state.accession?.trim()) count += 1;
  return count;
}

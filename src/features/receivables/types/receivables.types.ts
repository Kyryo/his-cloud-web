import type { PaginatedListResponse } from "@/types/api.types";

export const RECEIVABLES_AGING_BUCKETS = ["0-30", "31-60", "61-90", "90+"] as const;

export type ReceivablesAgingBucket = (typeof RECEIVABLES_AGING_BUCKETS)[number];

export type ReceivablesAgingTotal = {
  count: number;
  total: string;
};

export type ReceivablesDebtor = {
  customer_uuid: string;
  customer_identifier: string | null;
  customer_name: string | null;
  opening_balance: string;
  total_invoiced: string;
  total_paid: string;
  total_due: string;
};

export type ReceivablesInvoice = {
  invoice_uuid: string;
  invoice_number: string;
  invoice_date: string | null;
  customer_uuid: string | null;
  customer_identifier: string | null;
  customer_name: string | null;
  amount_total: string;
  amount_paid: string;
  balance: string;
  days_outstanding: number;
  aging_bucket: ReceivablesAgingBucket | string;
  currency: string | null;
};

export type ReceivablesSummaryStats = {
  debtors_count: number;
  total_receivable: string;
  open_invoice_count: number;
  aging: Record<ReceivablesAgingBucket, ReceivablesAgingTotal>;
};

export type ReceivablesListFilters = {
  page?: number;
  pageSize?: number;
  search?: string;
  agingBucket?: ReceivablesAgingBucket;
};

export type ReceivablesDebtorListResponse = PaginatedListResponse<ReceivablesDebtor>;
export type ReceivablesInvoiceListResponse =
  PaginatedListResponse<ReceivablesInvoice>;

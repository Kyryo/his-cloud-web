import type { PaginatedListResponse } from "@/types/api.types";

export type PaymentState = "draft" | "posted" | "cancel" | string;

export type Payment = {
  id: number;
  name: string;
  state: PaymentState;
  customer_id: number;
  customer_uuid: string | null;
  customer_name: string | null;
  invoice_id?: number | null;
  invoice_name?: string | null;
  amount: string | number;
  payment_date: string | null;
  payment_method?: string | null;
};

export type PaymentListFilters = {
  page?: number;
  pageSize?: number;
  name?: string;
  state?: string;
  paymentMethod?: string;
  dateFrom?: string;
  dateTo?: string;
  customerId?: number;
  invoiceId?: number;
};

export type PaymentListResponse = PaginatedListResponse<Payment>;

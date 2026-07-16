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
  invoice_state?: string | null;
  amount: string | number;
  payment_date: string | null;
  payment_method?: string | null;
  note?: string | null;
  recorded_by_name?: string | null;
  recorded_by_email?: string | null;
  can_cancel?: boolean;
  cancel_block_reason?: string | null;
};

export type PaymentListFilters = {
  page?: number;
  pageSize?: number;
  search?: string;
  state?: string;
  paymentMethod?: string;
  dateFrom?: string;
  dateTo?: string;
  customerId?: number;
  invoiceId?: number;
};

export type PaymentListResponse = PaginatedListResponse<Payment>;

export type SendPaymentReceiptPayload = {
  email: string;
};

export type CreatePaymentPayload = {
  invoiceId: number;
  amount: string;
  paymentMethod?: string;
  paymentDate?: string;
  note?: string;
};

export type UpdatePaymentPayload = {
  amount: string;
  paymentMethod?: string;
  paymentDate?: string;
  note?: string;
};

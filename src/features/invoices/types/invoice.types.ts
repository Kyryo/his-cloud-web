import type { PaginatedListResponse } from "@/types/api.types";

export type InvoiceState = "draft" | "posted" | "cancel" | string;

export type InvoiceLine = {
  id: number;
  name: string;
  product_id: number;
  product_name: string | null;
  quantity: string;
  price_unit: string;
  price_subtotal: string;
  price_total: string;
  sales_order_line_id?: number | null;
};

export type Invoice = {
  id: number;
  name: string;
  state: InvoiceState;
  move_type?: string | null;
  customer_id: number;
  customer_uuid: string | null;
  customer_name: string | null;
  amount_untaxed: string | number | null;
  amount_tax: string | number | null;
  amount_total: string | number | null;
  invoice_date: string | null;
  invoice_origin?: string | null;
  sales_order_id?: number | null;
  sales_order_name?: string | null;
  visit_id?: number | null;
  line_ids?: number[];
  lines?: InvoiceLine[];
};

export type InvoiceListFilters = {
  page?: number;
  pageSize?: number;
  name?: string;
  state?: string;
  dateFrom?: string;
  dateTo?: string;
  customerId?: number;
};

export type InvoiceListResponse = PaginatedListResponse<Invoice>;

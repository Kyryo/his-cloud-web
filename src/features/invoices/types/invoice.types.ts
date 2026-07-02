import type { PaginatedListResponse } from "@/types/api.types";

export type InvoiceState = "draft" | "posted" | "cancel" | string;

export type InvoicePaymentStatus =
  | "not_paid"
  | "partially_paid"
  | "paid"
  | "overpaid"
  | string;

export type InvoiceLine = {
  id: number;
  name: string;
  product_id: number;
  product_name: string | null;
  tariff_code?: string | null;
  quantity: string;
  price_unit: string;
  price_subtotal: string;
  price_total: string;
  sales_order_line_id?: number | null;
  is_payable: boolean;
  list_price_at_order?: string | number | null;
  pricelist_amount_at_order?: string | number | null;
  insurer_due?: string | number | null;
  client_due?: string | number | null;
  has_excess?: boolean;
  excess_amount?: string | number | null;
  pricing_rule_snapshot?: Record<string, unknown> | null;
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
  pricelist_id?: number | null;
  pricelist_name?: string | null;
  visit_id?: number | null;
  amount_paid?: string | number | null;
  amount_residual?: string | number | null;
  payment_status?: InvoicePaymentStatus;
  authorization_number?: string | null;
  insurance_company?: string | null;
  insurance_scheme_id?: number | null;
  insurance_scheme_name?: string | null;
  insurance_number?: string | null;
  insurance_number_prefix?: string | null;
  has_diagnosis?: boolean;
  can_initiate_claim?: boolean;
  claim_status?: string | null;
  service_provider_code?: string | null;
  has_practitioner_mapping?: boolean;
  visit_uuid?: string | null;
  encounter_uuid?: string | null;
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
  paymentStatus?: string;
};

export type InvoiceListResponse = PaginatedListResponse<Invoice>;

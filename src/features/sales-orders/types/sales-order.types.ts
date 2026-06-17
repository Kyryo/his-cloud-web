import type { PaginatedListResponse } from "@/types/api.types";

export type SalesOrderState =
  | "draft"
  | "sent"
  | "sale"
  | "done"
  | "cancel"
  | string;

export type SalesOrderInvoiceStatus =
  | "no"
  | "to invoice"
  | "invoiced"
  | "upselling"
  | string;

export type SalesOrder = {
  id: number;
  name: string;
  date_order: string | null;
  state: SalesOrderState;
  invoice_status: SalesOrderInvoiceStatus;
  customer_id: number;
  customer_uuid: string | null;
  customer_name: string | null;
  amount_untaxed: string | number | null;
  amount_tax: string | number | null;
  amount_total: string | number | null;
  currency_code: string | null;
  pricelist_id: number | null;
  pricelist_name: string | null;
  clinic_id: number | null;
  clinic_name: string | null;
  visit_id: number | null;
  visit_uuid: string | null;
  provider_id: number | null;
  provider_name: string | null;
  insurance_scheme_id: number | null;
  insurance_scheme_name: string | null;
  insurance_company: string | null;
  insurance_number: string | null;
  insurance_number_prefix: string | null;
  authorization_number: string | null;
  client_order_ref?: string | null;
  note?: string | null;
  validity_date?: string | null;
  commitment_date?: string | null;
  line_ids?: number[];
  lines?: SalesOrderLine[];
};

export type SalesOrderLine = {
  id: number;
  name: string;
  product_id: number;
  product_name?: string | null;
  quantity: string | number;
  price_unit?: string | number | null;
  price_subtotal?: string | number | null;
  price_tax?: string | number | null;
  price_total?: string | number | null;
  discount?: string | number | null;
  tariff_code?: string | null;
};

export type SalesOrderInvoice = {
  id: number;
  name?: string | null;
  state?: string | null;
  move_type?: string | null;
  customer_id?: number | null;
  customer_name?: string | null;
  amount_total?: string | number | null;
  invoice_date?: string | null;
  invoice_origin?: string | null;
};

export type CreateSalesOrderInvoiceResponse = {
  sales_order: number;
  invoice: SalesOrderInvoice;
};

export type SalesOrderListFilters = {
  page?: number;
  pageSize?: number;
  name?: string;
  state?: string;
  invoiceStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  customerId?: number;
  visitId?: number;
};

export type SalesOrdersListResponse = PaginatedListResponse<SalesOrder>;

export type CreateSalesOrderPayload = {
  customer_id: number;
  pricelist_id?: number;
  clinic_id?: number;
  clinic_name?: string;
  client_order_ref?: string;
  note?: string;
};

export type CreateSalesOrderLinePayload = {
  product_id: number;
  quantity: number | string;
  price_unit?: number | string;
  name?: string;
  tariff_code?: string | null;
};

export type UpdateSalesOrderLinePricePayload = {
  price_unit: number | string;
};

export type UpdateSalesOrderLinePayload = {
  tariff_code?: string | null;
};

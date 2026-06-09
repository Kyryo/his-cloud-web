import type { PaginatedListResponse } from "@/types/api.types";

/** Odoo many2one field: [id, display_name] */
export type OdooRelation = [number, string];

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
  partner_id: OdooRelation | false | null;
  amount_untaxed: string | number | null;
  amount_tax: string | number | null;
  amount_total: string | number | null;
  currency_id: OdooRelation | false | null;
  pricelist_id: OdooRelation | false | null;
  company_id: OdooRelation | false | null;
  user_id: OdooRelation | false | null;
  x_visit_id: number | OdooRelation | false | null;
  payment_term_id?: OdooRelation | false | null;
  client_order_ref?: string | null;
  note?: string | null;
  validity_date?: string | null;
  commitment_date?: string | null;
  order_line?: number[];
  order_lines?: SalesOrderLine[];
};

export type SalesOrderLine = {
  id: number;
  name: string;
  product_id?: OdooRelation | false | null;
  product_uom_qty?: number | string | null;
  qty_delivered?: number | string | null;
  qty_invoiced?: number | string | null;
  price_unit?: string | number | null;
  price_subtotal?: string | number | null;
  price_tax?: string | number | null;
  price_total?: string | number | null;
  discount?: string | number | null;
  tax_id?: number[] | OdooRelation[] | false | null;
};

export type SalesOrderListFilters = {
  page?: number;
  pageSize?: number;
  name?: string;
  state?: string;
  invoiceStatus?: string;
  dateFrom?: string;
  dateTo?: string;
  partnerId?: number;
  visitId?: number;
};

export type SalesOrdersListResponse = PaginatedListResponse<SalesOrder>;

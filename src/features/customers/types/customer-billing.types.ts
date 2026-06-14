export type CustomerBillingPagination = {
  count: number;
  limit: number;
  offset: number;
  has_next: boolean;
  has_previous: boolean;
};

export type CustomerSalesOrderRecord = {
  id: number;
  name: string;
  date_order: string;
  amount_total: number;
  state: string;
  invoice_status?: string;
};

export type CustomerBillingTotals = {
  total_sales: number;
  total_invoiced: number;
  total_paid: number;
  total_due: number;
};

export type CustomerBillingSummary = {
  sales_order_ids?: CustomerSalesOrderRecord[];
  sales_orders_pagination: CustomerBillingPagination;
  invoices_pagination: CustomerBillingPagination;
  payments_pagination: CustomerBillingPagination;
  totals: CustomerBillingTotals;
};

export type CustomerBillingCounts = {
  salesOrders: number;
  invoices: number;
  payments: number;
};

export type FetchCustomerSalesOrdersOptions = {
  limit?: number;
  offset?: number;
};

export type CustomerSalesOrdersResponse = {
  salesOrders: CustomerSalesOrderRecord[];
  pagination: CustomerBillingPagination;
  totals: CustomerBillingTotals;
};

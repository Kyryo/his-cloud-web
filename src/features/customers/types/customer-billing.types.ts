export type CustomerBillingPagination = {
  count: number;
  limit: number;
  offset: number;
  has_next: boolean;
  has_previous: boolean;
};

export type CustomerBillingTotals = {
  total_sales: number;
  total_invoiced: number;
  total_paid: number;
  total_due: number;
};

export type CustomerBillingSummary = {
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

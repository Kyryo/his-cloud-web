export type CustomerBillingStatBucket = {
  count: number;
  total: number | string;
};

export type CustomerInvoicesStats = {
  all: CustomerBillingStatBucket;
  paid: CustomerBillingStatBucket;
  not_paid: CustomerBillingStatBucket;
  partially_paid: CustomerBillingStatBucket;
};

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
  opening_balance: number | string;
  opening_balance_paid?: number | string;
  opening_balance_remaining?: number | string;
  total_sales: number | string;
  total_invoiced: number | string;
  total_paid: number | string;
  total_due: number | string;
};

export type CustomerInvoiceRecord = {
  id: number;
  name: string;
  state: string;
  amount_total: string | number;
  invoice_date: string;
  customer_id?: number;
  customer_name?: string | null;
  invoice_origin?: string | null;
};

export type CustomerPaymentRecord = {
  id: number;
  name: string;
  state: string;
  amount: string | number;
  payment_date: string;
  payment_method?: string | null;
  customer_id?: number;
  customer_name?: string | null;
  invoice_id?: number | null;
  invoice_name?: string | null;
  applies_to_opening_balance?: boolean;
};

export type CustomerBillingSummary = {
  sales_orders?: CustomerSalesOrderRecord[];
  invoices?: CustomerInvoiceRecord[];
  payments?: CustomerPaymentRecord[];
  sales_orders_pagination: CustomerBillingPagination;
  invoices_pagination: CustomerBillingPagination;
  payments_pagination: CustomerBillingPagination;
  sales_orders_stats?: {
    total_orders: number;
    draft_orders: number;
    invoiced_orders: number;
    canceled_orders: number;
  };
  invoices_stats?: CustomerInvoicesStats;
  totals: CustomerBillingTotals;
};

export type CustomerBillingCounts = {
  salesOrders: number;
  invoices: number;
  payments: number;
};

export type FetchCustomerBillingListOptions = {
  limit?: number;
  offset?: number;
};

export type CustomerSalesOrdersResponse = {
  salesOrders: CustomerSalesOrderRecord[];
  pagination: CustomerBillingPagination;
  totals: CustomerBillingTotals;
};

export type CustomerInvoicesResponse = {
  invoices: CustomerInvoiceRecord[];
  pagination: CustomerBillingPagination;
  totals: CustomerBillingTotals;
  invoicesStats: CustomerInvoicesStats | null;
};

export type CustomerPaymentsResponse = {
  payments: CustomerPaymentRecord[];
  pagination: CustomerBillingPagination;
  totals: CustomerBillingTotals;
  invoicesStats: CustomerInvoicesStats | null;
};

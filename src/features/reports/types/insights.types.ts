export type InsightsPeriod = "day" | "week" | "month";

export type InsightsFilters = {
  dateFrom: string;
  dateTo: string;
  period?: InsightsPeriod;
  clinicUuid?: string;
};

export type SalesActivityPoint = {
  label: string;
  sales_orders: string;
  invoices: string;
  payments: string;
};

export type SalesByProviderPoint = {
  provider_id: number | null;
  provider_name: string;
  total: string;
};

export type VisitsByPeriodPoint = {
  label: string;
  count: number;
};

export type SalesActivityResponse = {
  series: SalesActivityPoint[];
};

export type SalesByProviderResponse = {
  providers: SalesByProviderPoint[];
};

export type VisitsByPeriodResponse = {
  series: VisitsByPeriodPoint[];
};

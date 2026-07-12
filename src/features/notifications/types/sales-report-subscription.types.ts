export type SalesReportSubscription = {
  daily_enabled: boolean;
  weekly_enabled: boolean;
  monthly_enabled: boolean;
  is_active: boolean;
  is_blocked: boolean;
  updated_at: string;
};

export type UpdateSalesReportSubscriptionPayload = {
  daily_enabled?: boolean;
  weekly_enabled?: boolean;
  monthly_enabled?: boolean;
  is_active?: boolean;
};

export type AdminUpdateSalesReportSubscriptionPayload =
  UpdateSalesReportSubscriptionPayload & {
    is_blocked?: boolean;
  };

export type UnsubscribeSalesReportsPayload = {
  token: string;
};

export type UnsubscribeSalesReportsResponse = {
  subscription: SalesReportSubscription;
  message: string;
};

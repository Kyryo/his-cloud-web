export type AppointmentsReportSubscription = {
  daily_enabled: boolean;
  is_active: boolean;
  is_blocked: boolean;
  updated_at: string;
};

export type UpdateAppointmentsReportSubscriptionPayload = {
  daily_enabled?: boolean;
  is_active?: boolean;
};

export type UnsubscribeAppointmentsReportsPayload = {
  token: string;
};

export type UnsubscribeAppointmentsReportsResponse = {
  subscription: AppointmentsReportSubscription;
  message: string;
};

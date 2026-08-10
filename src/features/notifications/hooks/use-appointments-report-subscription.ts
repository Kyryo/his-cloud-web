import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchAppointmentsReportSubscription,
  updateAppointmentsReportSubscription,
} from "@/features/notifications/services/appointments-report-subscription.service";

export const APPOINTMENTS_REPORT_SUBSCRIPTION_QUERY_KEY = [
  "appointments-report-subscription",
] as const;

export function useAppointmentsReportSubscription() {
  return useQuery({
    queryKey: APPOINTMENTS_REPORT_SUBSCRIPTION_QUERY_KEY,
    queryFn: fetchAppointmentsReportSubscription,
  });
}

export function useUpdateAppointmentsReportSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAppointmentsReportSubscription,
    onSuccess: (subscription) => {
      queryClient.setQueryData(
        APPOINTMENTS_REPORT_SUBSCRIPTION_QUERY_KEY,
        subscription,
      );
    },
  });
}

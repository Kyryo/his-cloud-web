import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchSalesReportSubscription,
  updateSalesReportSubscription,
} from "@/features/notifications/services/sales-report-subscription.service";

export const SALES_REPORT_SUBSCRIPTION_QUERY_KEY = [
  "sales-report-subscription",
] as const;

export function useSalesReportSubscription() {
  return useQuery({
    queryKey: SALES_REPORT_SUBSCRIPTION_QUERY_KEY,
    queryFn: fetchSalesReportSubscription,
  });
}

export function useUpdateSalesReportSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSalesReportSubscription,
    onSuccess: (subscription) => {
      queryClient.setQueryData(SALES_REPORT_SUBSCRIPTION_QUERY_KEY, subscription);
    },
  });
}

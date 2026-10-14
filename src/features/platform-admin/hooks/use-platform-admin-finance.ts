import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { platformAdminOverviewQueryKey } from "@/features/platform-admin/hooks/use-platform-admin-overview-query";
import {
  createPlatformAdminCashSnapshot,
  createPlatformAdminOperatingCost,
  createPlatformAdminTenantPayment,
  fetchPlatformAdminTenants,
  listPlatformAdminCashSnapshots,
  listPlatformAdminOperatingCosts,
  listPlatformAdminTenantPayments,
} from "@/features/platform-admin/services/platform-admin.service";
import type {
  PlatformAdminCashSnapshotPayload,
  PlatformAdminOperatingCostPayload,
  PlatformAdminTenantPaymentPayload,
} from "@/features/platform-admin/types/platform-admin.types";
import type { FinanceRecords } from "@/features/platform-admin/utils/finance-series";

export const platformAdminFinanceQueryKey = [
  "platform-admin",
  "finance",
  "records",
] as const;
export const platformAdminFinanceTenantsQueryKey = [
  "platform-admin",
  "finance",
  "tenants",
] as const;

const PAGE_SIZE = 500;

export function usePlatformAdminFinanceRecordsQuery() {
  return useQuery({
    queryKey: platformAdminFinanceQueryKey,
    queryFn: async (): Promise<FinanceRecords> => {
      const [payments, costs, cash] = await Promise.all([
        listPlatformAdminTenantPayments({
          pageSize: PAGE_SIZE,
          ordering: "-payment_date",
        }),
        listPlatformAdminOperatingCosts({
          pageSize: PAGE_SIZE,
          ordering: "-cost_date",
        }),
        listPlatformAdminCashSnapshots({
          pageSize: PAGE_SIZE,
          ordering: "-balance_date",
        }),
      ]);
      return {
        payments: payments.results,
        costs: costs.results,
        cash: cash.results,
      };
    },
  });
}

export function usePlatformAdminFinanceTenantsQuery(enabled: boolean) {
  return useQuery({
    queryKey: platformAdminFinanceTenantsQueryKey,
    queryFn: async () =>
      (await fetchPlatformAdminTenants({ pageSize: 200, ordering: "name" }))
        .results,
    enabled,
    staleTime: 5 * 60_000,
  });
}

export type FinanceEntryPayload =
  | { kind: "payment"; payload: PlatformAdminTenantPaymentPayload }
  | { kind: "cost"; payload: PlatformAdminOperatingCostPayload }
  | { kind: "cash"; payload: PlatformAdminCashSnapshotPayload };

export function useCreateFinanceEntryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entry: FinanceEntryPayload) => {
      if (entry.kind === "payment")
        return createPlatformAdminTenantPayment(entry.payload);
      if (entry.kind === "cost")
        return createPlatformAdminOperatingCost(entry.payload);
      return createPlatformAdminCashSnapshot(entry.payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: platformAdminFinanceQueryKey,
      });
      void queryClient.invalidateQueries({
        queryKey: platformAdminOverviewQueryKey,
      });
    },
  });
}

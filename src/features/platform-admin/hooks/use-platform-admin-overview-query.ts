import { useQuery } from "@tanstack/react-query";

import {
  fetchPlatformAdminOverview,
  fetchPlatformAdminTenants,
} from "@/features/platform-admin/services/platform-admin.service";

export const platformAdminOverviewQueryKey = [
  "platform-admin",
  "overview",
] as const;

/** Loads the overview metrics together with the tenant list used by finance entry. */
export function usePlatformAdminOverviewQuery() {
  return useQuery({
    queryKey: platformAdminOverviewQueryKey,
    queryFn: async () => {
      const [overview, tenantData] = await Promise.all([
        fetchPlatformAdminOverview(),
        fetchPlatformAdminTenants({ pageSize: 200 }),
      ]);
      return { overview, tenants: tenantData.results };
    },
  });
}

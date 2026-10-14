import { useQuery } from "@tanstack/react-query";

import {
  fetchPlatformAdminDashboard,
  fetchPlatformAdminOverview,
  fetchPlatformAdminTenants,
} from "@/features/platform-admin/services/platform-admin.service";

export const platformAdminOverviewQueryKey = [
  "platform-admin",
  "overview",
] as const;
export const platformAdminDashboardQueryKey = [
  "platform-admin",
  "dashboard",
] as const;

export const OVERVIEW_TENANT_PAGE_SIZE = 200;

/** Loads the overview metrics together with the tenant list used by charts and finance entry. */
export function usePlatformAdminOverviewQuery() {
  return useQuery({
    queryKey: platformAdminOverviewQueryKey,
    queryFn: async () => {
      const [overview, tenantData] = await Promise.all([
        fetchPlatformAdminOverview(),
        fetchPlatformAdminTenants({ pageSize: OVERVIEW_TENANT_PAGE_SIZE }),
      ]);
      const totalTenants =
        tenantData.pagination?.count ?? tenantData.results.length;
      return {
        overview,
        tenants: tenantData.results,
        tenantsArePartial: totalTenants > tenantData.results.length,
      };
    },
  });
}

/** Platform-wide counts (clinics, users, ...). Optional: the overview renders without it. */
export function usePlatformAdminDashboardQuery() {
  return useQuery({
    queryKey: platformAdminDashboardQueryKey,
    queryFn: fetchPlatformAdminDashboard,
  });
}

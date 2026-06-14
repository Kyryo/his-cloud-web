import { useQuery } from "@tanstack/react-query";

import { fetchTenantEmailConfiguration } from "@/features/settings/services/settings.service";

export const tenantEmailConfigurationQueryKey = [
  "settings",
  "tenant-email-configuration",
] as const;

export function useTenantEmailConfiguration() {
  return useQuery({
    queryKey: tenantEmailConfigurationQueryKey,
    queryFn: fetchTenantEmailConfiguration,
  });
}

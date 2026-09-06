"use client";

import { OrganizationCareProvidersTab } from "@/features/settings/components/OrganizationCareProvidersTab";
import { OrganizationSettingsSubpage } from "@/features/settings/components/OrganizationSettingsSubpage";

export function OrganizationCareProvidersSettingsPage() {
  return (
    <OrganizationSettingsSubpage
      title="Care providers"
      description="Directory used on billing and clinical workflows."
    >
      <OrganizationCareProvidersTab isActive />
    </OrganizationSettingsSubpage>
  );
}

"use client";

import { OrganizationBrandingTab } from "@/features/settings/components/OrganizationBrandingTab";
import { OrganizationSettingsSubpage } from "@/features/settings/components/OrganizationSettingsSubpage";

export function OrganizationBrandingSettingsPage() {
  return (
    <OrganizationSettingsSubpage
      title="Branding"
      description="Logo and colors used across your organization's workspace."
    >
      <OrganizationBrandingTab isActive />
    </OrganizationSettingsSubpage>
  );
}

"use client";

import { OrganizationClinicsTab } from "@/features/settings/components/OrganizationClinicsTab";
import { OrganizationSettingsSubpage } from "@/features/settings/components/OrganizationSettingsSubpage";

export function OrganizationClinicsSettingsPage() {
  return (
    <OrganizationSettingsSubpage
      title="Clinics"
      description="Manage the clinic sites available to your organization."
    >
      <OrganizationClinicsTab isActive />
    </OrganizationSettingsSubpage>
  );
}

"use client";

import { OrganizationLocationsTab } from "@/features/settings/components/OrganizationLocationsTab";
import { OrganizationSettingsSubpage } from "@/features/settings/components/OrganizationSettingsSubpage";

export function OrganizationLocationsSettingsPage() {
  return (
    <OrganizationSettingsSubpage
      title="Locations"
      description="Manage rooms, stores, and other places within your clinics."
    >
      <OrganizationLocationsTab isActive />
    </OrganizationSettingsSubpage>
  );
}

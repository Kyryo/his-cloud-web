"use client";

import { useState } from "react";

import {
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
} from "@/features/app-shell/components/page-layout";
import { OrganizationBrandingTab } from "@/features/settings/components/OrganizationBrandingTab";
import { OrganizationCareProvidersTab } from "@/features/settings/components/OrganizationCareProvidersTab";
import { OrganizationClinicsTab } from "@/features/settings/components/OrganizationClinicsTab";
import { OrganizationDepartmentsTab } from "@/features/settings/components/OrganizationDepartmentsTab";
import { OrganizationGeneralTab } from "@/features/settings/components/OrganizationGeneralTab";
import { OrganizationLocationsTab } from "@/features/settings/components/OrganizationLocationsTab";
import type {
  OrganizationTabId,
  TenantDetail,
} from "@/features/settings/types/settings.types";

const tabs: Array<{ id: OrganizationTabId; label: string }> = [
  { id: "general", label: "General" },
  { id: "branding", label: "Branding" },
  { id: "clinics", label: "Clinics" },
  { id: "departments", label: "Departments" },
  { id: "locations", label: "Locations" },
  { id: "care-providers", label: "Care providers" },
];

type OrganizationSettingsTabsProps = {
  tenant: TenantDetail;
  onTenantUpdated: (tenant: TenantDetail) => void;
};

export function OrganizationSettingsTabs({
  tenant,
  onTenantUpdated,
}: OrganizationSettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<OrganizationTabId>("general");

  return (
    <div className="overflow-hidden rounded-xl border border-brand-border bg-white">
      <DetailPageTabsNavSection aria-label="Organization sections">
        {tabs.map((tab) => (
          <DetailPageTabNavItem
            key={tab.id}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </DetailPageTabNavItem>
        ))}
      </DetailPageTabsNavSection>

      <div className="px-6 py-8">
        {activeTab === "general" ? (
          <OrganizationGeneralTab tenant={tenant} onTenantUpdated={onTenantUpdated} />
        ) : null}
        <OrganizationBrandingTab isActive={activeTab === "branding"} />
        <OrganizationClinicsTab isActive={activeTab === "clinics"} />
        <OrganizationDepartmentsTab isActive={activeTab === "departments"} />
        <OrganizationLocationsTab isActive={activeTab === "locations"} />
        <OrganizationCareProvidersTab isActive={activeTab === "care-providers"} />
      </div>
    </div>
  );
}

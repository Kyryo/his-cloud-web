"use client";

import { useState } from "react";

import {
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
} from "@/features/app-shell/components/page-layout";
import { OrganizationBrandingTab } from "@/features/settings/components/OrganizationBrandingTab";
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
  { id: "departments", label: "Departments" },
  { id: "clinics", label: "Clinics" },
  { id: "locations", label: "Locations" },
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
        <OrganizationDepartmentsTab isActive={activeTab === "departments"} />
        <OrganizationClinicsTab isActive={activeTab === "clinics"} />
        <OrganizationLocationsTab isActive={activeTab === "locations"} />
      </div>
    </div>
  );
}

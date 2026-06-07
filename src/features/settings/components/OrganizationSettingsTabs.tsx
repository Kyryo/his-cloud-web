"use client";

import { useState } from "react";

import {
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
} from "@/features/app-shell/components/page-layout";
import { OrganizationClinicsTab } from "@/features/settings/components/OrganizationClinicsTab";
import { OrganizationGeneralTab } from "@/features/settings/components/OrganizationGeneralTab";
import { OrganizationLocationsTab } from "@/features/settings/components/OrganizationLocationsTab";
import { OrganizationPayersTab } from "@/features/settings/components/OrganizationPayersTab";
import { OrganizationServicesTab } from "@/features/settings/components/OrganizationServicesTab";
import type {
  OrganizationTabId,
  TenantDetail,
} from "@/features/settings/types/settings.types";

const tabs: Array<{ id: OrganizationTabId; label: string }> = [
  { id: "general", label: "General" },
  { id: "clinics", label: "Clinics" },
  { id: "locations", label: "Locations" },
  { id: "services", label: "Services" },
  { id: "payers", label: "Payers" },
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
        <OrganizationClinicsTab isActive={activeTab === "clinics"} />
        <OrganizationLocationsTab isActive={activeTab === "locations"} />
        <OrganizationServicesTab isActive={activeTab === "services"} />
        <OrganizationPayersTab isActive={activeTab === "payers"} />
      </div>
    </div>
  );
}

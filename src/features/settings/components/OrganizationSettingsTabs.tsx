"use client";

import { useState } from "react";

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
import { cn } from "@/lib/utils";

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
    <div>
      <nav
        className="flex gap-5 overflow-x-auto border-b border-brand-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Organization sections"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "shrink-0 pb-2.5 text-sm transition-colors",
                isActive
                  ? "font-medium text-brand-navy shadow-[inset_0_-2px_0_0_currentColor]"
                  : "text-slate-400 hover:text-brand-navy",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="pt-8">
        {activeTab === "general" ? (
          <OrganizationGeneralTab
            tenant={tenant}
            onTenantUpdated={onTenantUpdated}
          />
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

"use client";

import { Suspense, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import { SettingsUnderlineTabs } from "@/features/settings/components/SettingsPageLayout";
import { OhEmployersSettingsTab } from "@/features/settings/components/modules/occupational-health/OhEmployersSettingsTab";
import { OhHazardProfilesSettingsTab } from "@/features/settings/components/modules/occupational-health/OhHazardProfilesSettingsTab";
import { OhJobTitlesSettingsTab } from "@/features/settings/components/modules/occupational-health/OhJobTitlesSettingsTab";
import { OhSitesSettingsTab } from "@/features/settings/components/modules/occupational-health/OhSitesSettingsTab";

export type OhModuleTabId =
  | "employers"
  | "job-titles"
  | "hazard-profiles"
  | "sites";

const TABS: Array<{ id: OhModuleTabId; label: string }> = [
  { id: "employers", label: "Employers" },
  { id: "job-titles", label: "Job titles" },
  { id: "hazard-profiles", label: "Hazard profiles" },
  { id: "sites", label: "Sites" },
];

function parseTab(value: string | null): OhModuleTabId {
  if (value === "job-titles") {
    return "job-titles";
  }
  if (value === "hazard-profiles") {
    return "hazard-profiles";
  }
  if (value === "sites") {
    return "sites";
  }
  return "employers";
}

function OhModuleSettingsTabsInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = useMemo(
    () => parseTab(searchParams.get("tab")),
    [searchParams],
  );

  function setActiveTab(tab: OhModuleTabId) {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "employers") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div>
      <SettingsUnderlineTabs
        tabs={TABS}
        activeTab={activeTab}
        onChange={setActiveTab}
        ariaLabel="Occupational health module settings"
      />

      <div className="pt-2">
        <OhEmployersSettingsTab isActive={activeTab === "employers"} />
        <OhJobTitlesSettingsTab isActive={activeTab === "job-titles"} />
        <OhHazardProfilesSettingsTab
          isActive={activeTab === "hazard-profiles"}
        />
        <OhSitesSettingsTab isActive={activeTab === "sites"} />
      </div>
    </div>
  );
}

export function OhModuleSettingsTabs() {
  return (
    <Suspense fallback={<SettingsContentSkeleton />}>
      <OhModuleSettingsTabsInner />
    </Suspense>
  );
}

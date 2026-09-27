"use client";

import { useMemo, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ClientTagsSettingsTab } from "@/features/settings/components/ClientTagsSettingsTab";
import { ClientIdentifierSettingsPanel } from "@/features/settings/components/modules/front-desk/ClientIdentifierSettingsPanel";
import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import { SettingsUnderlineTabs } from "@/features/settings/components/SettingsPageLayout";

export type FrontDeskModuleTabId = "client-id" | "client-tags";

const TABS: Array<{ id: FrontDeskModuleTabId; label: string }> = [
  { id: "client-id", label: "Client ID / MRN" },
  { id: "client-tags", label: "Client tags" },
];

function parseTab(value: string | null): FrontDeskModuleTabId {
  return value === "client-tags" ? "client-tags" : "client-id";
}

function FrontDeskModuleSettingsTabsInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = useMemo(
    () => parseTab(searchParams.get("tab")),
    [searchParams],
  );

  function setActiveTab(tab: FrontDeskModuleTabId) {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "client-id") {
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
        ariaLabel="Front Desk module settings"
      />

      <div className="pt-6">
        {activeTab === "client-id" ? <ClientIdentifierSettingsPanel /> : null}
        {activeTab === "client-tags" ? (
          <ClientTagsSettingsTab isActive />
        ) : null}
      </div>
    </div>
  );
}

export function FrontDeskModuleSettingsTabs() {
  return (
    <Suspense fallback={<SettingsContentSkeleton />}>
      <FrontDeskModuleSettingsTabsInner />
    </Suspense>
  );
}

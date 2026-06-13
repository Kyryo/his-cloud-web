"use client";

import { useState } from "react";

import {
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
} from "@/features/app-shell/components/page-layout";
import { OrganizationPayerSchemesTab } from "@/features/settings/components/OrganizationPayerSchemesTab";
import { OrganizationPayersTab } from "@/features/settings/components/OrganizationPayersTab";
import { OrganizationPricelistsTab } from "@/features/settings/components/OrganizationPricelistsTab";
import type { FinanceOperationsTabId } from "@/features/settings/types/settings.types";

const tabs: Array<{ id: FinanceOperationsTabId; label: string }> = [
  { id: "payers", label: "Payers" },
  { id: "schemes", label: "Payer schemes" },
  { id: "pricelists", label: "Pricelists" },
];

export function FinanceOperationsSettingsTabs() {
  const [activeTab, setActiveTab] = useState<FinanceOperationsTabId>("payers");

  return (
    <div className="overflow-hidden rounded-xl border border-brand-border bg-white">
      <DetailPageTabsNavSection aria-label="Finance and operations sections">
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
        <OrganizationPayersTab isActive={activeTab === "payers"} />
        <OrganizationPayerSchemesTab isActive={activeTab === "schemes"} />
        <OrganizationPricelistsTab isActive={activeTab === "pricelists"} />
      </div>
    </div>
  );
}

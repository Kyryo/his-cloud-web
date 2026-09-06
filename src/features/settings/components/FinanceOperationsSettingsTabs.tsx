"use client";

import { useState } from "react";

import { OrganizationPayerSchemesTab } from "@/features/settings/components/OrganizationPayerSchemesTab";
import { OrganizationPayersTab } from "@/features/settings/components/OrganizationPayersTab";
import { OrganizationPricelistsTab } from "@/features/settings/components/OrganizationPricelistsTab";
import type { FinanceOperationsTabId } from "@/features/settings/types/settings.types";
import { cn } from "@/lib/utils";

const tabs: Array<{ id: FinanceOperationsTabId; label: string }> = [
  { id: "payers", label: "Payers" },
  { id: "schemes", label: "Payer schemes" },
  { id: "pricelists", label: "Pricelists" },
];

export function FinanceOperationsSettingsTabs() {
  const [activeTab, setActiveTab] = useState<FinanceOperationsTabId>("payers");

  return (
    <div>
      <nav
        className="flex gap-5 border-b border-brand-border"
        aria-label="Finance and operations sections"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "pb-2.5 text-sm transition-colors",
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
        <OrganizationPayersTab isActive={activeTab === "payers"} />
        <OrganizationPayerSchemesTab isActive={activeTab === "schemes"} />
        <OrganizationPricelistsTab isActive={activeTab === "pricelists"} />
      </div>
    </div>
  );
}

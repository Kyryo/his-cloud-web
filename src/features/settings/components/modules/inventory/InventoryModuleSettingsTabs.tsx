"use client";

import { useState } from "react";

import {
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
} from "@/features/app-shell/components/page-layout";
import { InventoryApprovalHistoryTab } from "@/features/settings/components/modules/inventory/InventoryApprovalHistoryTab";
import { InventoryApprovalPolicyTab } from "@/features/settings/components/modules/inventory/InventoryApprovalPolicyTab";
import { InventoryClinicConfigurationTab } from "@/features/settings/components/modules/inventory/InventoryClinicConfigurationTab";
import { InventoryWorkflowsTab } from "@/features/settings/components/modules/inventory/InventoryWorkflowsTab";

type InventoryModuleTabId =
  | "clinic-config"
  | "approval-policy"
  | "workflows"
  | "approval-history";

const tabs: Array<{ id: InventoryModuleTabId; label: string }> = [
  { id: "clinic-config", label: "Clinic configuration" },
  { id: "approval-policy", label: "Approval policy" },
  { id: "workflows", label: "Approval workflows" },
  { id: "approval-history", label: "Approval history" },
];

export function InventoryModuleSettingsTabs() {
  const [activeTab, setActiveTab] = useState<InventoryModuleTabId>("clinic-config");

  return (
    <div className="overflow-hidden rounded-xl border border-brand-border bg-white">
      <DetailPageTabsNavSection aria-label="Inventory module settings">
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
        <InventoryClinicConfigurationTab isActive={activeTab === "clinic-config"} />
        <InventoryApprovalPolicyTab isActive={activeTab === "approval-policy"} />
        <InventoryWorkflowsTab isActive={activeTab === "workflows"} />
        <InventoryApprovalHistoryTab isActive={activeTab === "approval-history"} />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

import {
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
} from "@/features/app-shell/components/page-layout";
import { UserManagementGroupsTab } from "@/features/settings/components/UserManagementGroupsTab";
import { UserManagementUsersTab } from "@/features/settings/components/UserManagementUsersTab";
import type { UserManagementTabId } from "@/features/settings/types/settings.types";

const tabs: Array<{ id: UserManagementTabId; label: string }> = [
  { id: "users", label: "Users" },
  { id: "groups", label: "Groups" },
];

export function UserManagementSettingsTabs() {
  const [activeTab, setActiveTab] = useState<UserManagementTabId>("users");

  return (
    <div className="overflow-hidden rounded-xl border border-brand-border bg-white">
      <DetailPageTabsNavSection aria-label="User management sections">
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
        <UserManagementUsersTab isActive={activeTab === "users"} />
        <UserManagementGroupsTab isActive={activeTab === "groups"} />
      </div>
    </div>
  );
}

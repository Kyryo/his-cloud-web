"use client";

import { useState } from "react";

import { UserManagementGroupsTab } from "@/features/settings/components/UserManagementGroupsTab";
import { UserManagementUsersTab } from "@/features/settings/components/UserManagementUsersTab";
import type { UserManagementTabId } from "@/features/settings/types/settings.types";
import { cn } from "@/lib/utils";

const tabs: Array<{ id: UserManagementTabId; label: string }> = [
  { id: "users", label: "Users" },
  { id: "groups", label: "Groups" },
];

export function UserManagementSettingsTabs() {
  const [activeTab, setActiveTab] = useState<UserManagementTabId>("users");

  return (
    <div>
      <nav
        className="flex gap-5 border-b border-brand-border"
        aria-label="User management sections"
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
        <UserManagementUsersTab isActive={activeTab === "users"} />
        <UserManagementGroupsTab isActive={activeTab === "groups"} />
      </div>
    </div>
  );
}

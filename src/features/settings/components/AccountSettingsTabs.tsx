"use client";

import { useState } from "react";

import type { User } from "@/features/auth/types/auth.types";
import { AccountAppointmentsReportsSection } from "@/features/settings/components/AccountAppointmentsReportsSection";
import { AccountAppointmentsSection } from "@/features/settings/components/AccountAppointmentsSection";
import { AccountProfileSettings } from "@/features/settings/components/AccountProfileSettings";
import { AccountSalesReportsSection } from "@/features/settings/components/AccountSalesReportsSection";
import { AssignedClinicsList } from "@/features/settings/components/AssignedClinicsList";
import { SettingsUnderlineTabs } from "@/features/settings/components/SettingsPageLayout";

type AccountTabId = "profile" | "notifications" | "appointments" | "clinics";

const tabs: Array<{ id: AccountTabId; label: string }> = [
  { id: "profile", label: "Profile" },
  { id: "notifications", label: "Notifications" },
  { id: "appointments", label: "Appointments" },
  { id: "clinics", label: "Clinics" },
];

type AccountSettingsTabsProps = {
  user: User;
};

export function AccountSettingsTabs({ user }: AccountSettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<AccountTabId>("profile");

  return (
    <div>
      <SettingsUnderlineTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        ariaLabel="Account sections"
      />

      <div className="pt-8">
        {activeTab === "profile" ? (
          <AccountProfileSettings user={user} />
        ) : null}

        {activeTab === "notifications" ? (
          <div className="space-y-8">
            <AccountAppointmentsReportsSection />
            <AccountSalesReportsSection />
          </div>
        ) : null}

        {activeTab === "appointments" ? <AccountAppointmentsSection /> : null}

        {activeTab === "clinics" ? (
          <div className="space-y-5">
            <p className="max-w-xl text-sm text-slate-400">
              Clinics linked to your account and your role at each location.
            </p>
            <AssignedClinicsList clinics={user.clinics ?? []} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

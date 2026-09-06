"use client";

import { AccountTwoFactorSection } from "@/features/settings/components/AccountTwoFactorSection";
import { SettingsPageLayout } from "@/features/settings/components/SettingsPageLayout";

export function SecuritySettingsPage() {
  return (
    <SettingsPageLayout
      title="Security"
      description="Protect your account with extra verification methods. Email codes stay required for every sign-in."
      className="max-w-3xl"
    >
      <AccountTwoFactorSection />
    </SettingsPageLayout>
  );
}

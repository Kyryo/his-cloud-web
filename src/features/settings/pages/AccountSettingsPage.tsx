"use client";

import { PageLoader } from "@/components/page-loader";
import { AccountProfileSettings } from "@/features/settings/components/AccountProfileSettings";
import {
  SettingsPageLayout,
  SettingsSection,
} from "@/features/settings/components/SettingsPageLayout";
import { useUser } from "@/providers/user-provider";

export function AccountSettingsPage() {
  const { userData, isLoading } = useUser();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!userData) {
    return (
      <SettingsPageLayout
        title="Account"
        description="Manage your personal profile and clinic assignments."
      >
        <SettingsSection title="Unable to load account">
          <p className="text-sm text-brand-muted">
            We could not load your account details. Try signing in again.
          </p>
        </SettingsSection>
      </SettingsPageLayout>
    );
  }

  return (
    <SettingsPageLayout
      className="max-w-3xl"
      title="Account"
      description="Manage your profile, preferences, and clinic access."
    >
      <AccountProfileSettings user={userData} />
    </SettingsPageLayout>
  );
}

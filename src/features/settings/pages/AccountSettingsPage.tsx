"use client";

import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import { AccountProfileSettings } from "@/features/settings/components/AccountProfileSettings";
import { SettingsPageLayout } from "@/features/settings/components/SettingsPageLayout";
import { useUser } from "@/providers/user-provider";

export function AccountSettingsPage() {
  const { userData, isLoading } = useUser();

  if (isLoading) {
    return <SettingsContentSkeleton variant="form" />;
  }

  if (!userData) {
    return (
      <SettingsPageLayout
        title="Account"
        description="Manage your personal profile and clinic assignments."
      >
        <p className="text-sm text-brand-muted">
          We could not load your account details. Try signing in again.
        </p>
      </SettingsPageLayout>
    );
  }

  return (
    <SettingsPageLayout
      className="max-w-2xl"
      title="Account"
      description="Manage your profile, preferences, and clinic access."
    >
      <AccountProfileSettings user={userData} />
    </SettingsPageLayout>
  );
}

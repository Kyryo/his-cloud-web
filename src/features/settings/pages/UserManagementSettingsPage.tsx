"use client";

import Link from "next/link";

import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { UserManagementSettingsTabs } from "@/features/settings/components/UserManagementSettingsTabs";
import {
  SettingsPageLayout,
  SettingsSection,
} from "@/features/settings/components/SettingsPageLayout";
import { useUser } from "@/providers/user-provider";

export function UserManagementSettingsPage() {
  const { userData, isLoading } = useUser();
  const isTenantAdmin = Boolean(userData?.is_admin);

  if (isLoading) {
    return <SettingsContentSkeleton />;
  }

  if (!isTenantAdmin) {
    return (
      <SettingsPageLayout
        title="User Management"
        description="User and group settings are available to tenant administrators."
      >
        <SettingsSection title="Access restricted">
          <div className="space-y-4">
            <p className="text-sm text-brand-muted">
              You need tenant administrator permissions to manage users and groups.
              Contact your administrator if you believe this is a mistake.
            </p>
            <Button asChild variant="outline">
              <Link href={ROUTES.settingsAccount}>Back to account settings</Link>
            </Button>
          </div>
        </SettingsSection>
      </SettingsPageLayout>
    );
  }

  return (
    <SettingsPageLayout
      title="User Management"
      description="Invite team members, manage access groups, and keep your organization roster up to date."
      className="max-w-3xl"
    >
      <UserManagementSettingsTabs />
    </SettingsPageLayout>
  );
}

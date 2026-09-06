"use client";

import Link from "next/link";

import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import { Button } from "@/components/ui/button";
import {
  SettingsPageLayout,
  SettingsSection,
} from "@/features/settings/components/SettingsPageLayout";
import { ModuleSettingsList } from "@/features/settings/components/modules/ModuleSettingsList";
import { ROUTES } from "@/constants/routes";
import { useUser } from "@/providers/user-provider";

export function ModulesSettingsPage() {
  const { userData, isLoading } = useUser();
  const isTenantAdmin = Boolean(userData?.is_admin);

  if (isLoading) {
    return <SettingsContentSkeleton />;
  }

  if (!isTenantAdmin) {
    return (
      <SettingsPageLayout
        title="Modules"
        description="Module settings are available to tenant administrators."
      >
        <SettingsSection title="Access restricted">
          <div className="space-y-4">
            <p className="text-sm text-brand-muted">
              You need tenant administrator access to configure module settings.
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
      title="Modules"
      description="Configure operational modules for your organization. Additional modules will become available here over time."
      className="max-w-3xl"
    >
      <ModuleSettingsList />
    </SettingsPageLayout>
  );
}

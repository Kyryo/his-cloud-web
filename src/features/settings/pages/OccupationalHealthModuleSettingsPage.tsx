"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { OhModuleSettingsTabs } from "@/features/settings/components/modules/occupational-health/OhModuleSettingsTabs";
import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import {
  SettingsPageLayout,
  SettingsSection,
} from "@/features/settings/components/SettingsPageLayout";
import { ROUTES } from "@/constants/routes";
import { useUser } from "@/providers/user-provider";

export function OccupationalHealthModuleSettingsPage() {
  const { userData, isLoading } = useUser();
  const isTenantAdmin = Boolean(userData?.is_admin);

  if (isLoading) {
    return <SettingsContentSkeleton />;
  }

  if (!isTenantAdmin) {
    return (
      <SettingsPageLayout
        title="Occupational health"
        description="Occupational health module settings are available to tenant administrators."
      >
        <SettingsSection title="Access restricted">
          <div className="space-y-4">
            <p className="text-sm text-brand-muted">
              You need tenant administrator access to configure occupational
              health catalogs.
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
      title="Occupational health"
      description="Manage employers, job titles, hazard profiles, and sites."
      className="max-w-3xl"
    >
      <OhModuleSettingsTabs />
    </SettingsPageLayout>
  );
}

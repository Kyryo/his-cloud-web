"use client";

import Link from "next/link";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import { EmrModuleSettingsTabs } from "@/features/settings/components/modules/emr/EmrModuleSettingsTabs";
import {
  SettingsPageLayout,
  SettingsSection,
} from "@/features/settings/components/SettingsPageLayout";
import { ROUTES } from "@/constants/routes";
import { useUser } from "@/providers/user-provider";

export function EmrModuleSettingsPage() {
  const { userData, isLoading } = useUser();
  const isTenantAdmin = Boolean(userData?.is_admin);

  if (isLoading) {
    return <SettingsContentSkeleton variant="staff" />;
  }

  if (!isTenantAdmin) {
    return (
      <SettingsPageLayout
        title="EMR"
        description="EMR module settings are available to tenant administrators."
      >
        <SettingsSection title="Access restricted">
          <div className="space-y-4">
            <p className="text-sm text-brand-muted">
              You need tenant administrator access to configure EMR settings.
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
      title="EMR"
      description="Manage clinical providers and role capabilities for the EMR workspace."
      className="max-w-3xl"
    >
      <Suspense fallback={<SettingsContentSkeleton variant="staff" />}>
        <EmrModuleSettingsTabs />
      </Suspense>
    </SettingsPageLayout>
  );
}

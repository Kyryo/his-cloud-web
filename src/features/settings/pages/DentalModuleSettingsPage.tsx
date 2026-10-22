"use client";

import Link from "next/link";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import { DentalModuleSettingsTabs } from "@/features/settings/components/modules/dental/DentalModuleSettingsTabs";
import {
  SettingsPageLayout,
  SettingsSection,
} from "@/features/settings/components/SettingsPageLayout";
import { ROUTES } from "@/constants/routes";
import { useUser } from "@/providers/user-provider";

export function DentalModuleSettingsPage() {
  const { userData, isLoading } = useUser();
  const isTenantAdmin = Boolean(userData?.is_admin);

  if (isLoading) {
    return <SettingsContentSkeleton variant="staff" />;
  }

  if (!isTenantAdmin) {
    return (
      <SettingsPageLayout
        title="Dental"
        description="Dental module settings are available to tenant administrators."
      >
        <SettingsSection title="Access restricted">
          <div className="space-y-4">
            <p className="text-sm text-brand-muted">
              You need tenant administrator access to configure dental settings.
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
      title="Dental"
      description="Manage dentists and role capabilities for the dental workspace."
      className="max-w-3xl"
    >
      <Suspense fallback={<SettingsContentSkeleton variant="staff" />}>
        <DentalModuleSettingsTabs />
      </Suspense>
    </SettingsPageLayout>
  );
}

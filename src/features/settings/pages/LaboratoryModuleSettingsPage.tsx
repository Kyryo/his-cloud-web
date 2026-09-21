"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { LabSettingsForm } from "@/features/laboratory/components/catalog/LabSettingsForm";
import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import {
  SettingsPageLayout,
  SettingsSection,
} from "@/features/settings/components/SettingsPageLayout";
import { ROUTES } from "@/constants/routes";
import { useUser } from "@/providers/user-provider";

export function LaboratoryModuleSettingsPage() {
  const { userData, isLoading } = useUser();
  const isTenantAdmin = Boolean(userData?.is_admin);

  if (isLoading) {
    return <SettingsContentSkeleton />;
  }

  if (!isTenantAdmin) {
    return (
      <SettingsPageLayout
        title="Laboratory"
        description="Laboratory module settings are available to tenant administrators."
      >
        <SettingsSection title="Access restricted">
          <div className="space-y-4">
            <p className="text-sm text-brand-muted">
              You need tenant administrator access to configure laboratory
              settings.
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
      title="Laboratory"
      description="Tenant defaults for accessioning, release, reporting, and analyzer ingest."
      className="max-w-3xl"
    >
      <div data-testid="laboratory-module-settings-page">
        <LabSettingsForm variant="settings" />
      </div>
    </SettingsPageLayout>
  );
}

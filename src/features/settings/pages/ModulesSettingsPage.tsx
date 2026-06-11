"use client";

import Link from "next/link";

import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import {
  SettingsPageLayout,
  SettingsSection,
} from "@/features/settings/components/SettingsPageLayout";
import { ModuleSettingsGrid } from "@/features/settings/components/modules/ModuleSettingsGrid";
import { ROUTES } from "@/constants/routes";
import { useUser } from "@/providers/user-provider";

export function ModulesSettingsPage() {
  const { userData, isLoading } = useUser();
  const isTenantAdmin = Boolean(userData?.is_admin);

  if (isLoading) {
    return <PageLoader />;
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
    >
      <ModuleSettingsGrid />
    </SettingsPageLayout>
  );
}

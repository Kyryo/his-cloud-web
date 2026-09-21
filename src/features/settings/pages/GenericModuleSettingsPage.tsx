"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import { ModuleSettingsEmptyState } from "@/features/settings/components/modules/ModuleSettingsEmptyState";
import {
  SettingsPageLayout,
  SettingsSection,
} from "@/features/settings/components/SettingsPageLayout";
import type { ModuleSettingsItem } from "@/features/settings/constants/module-settings-cards";
import { ROUTES } from "@/constants/routes";
import { useUser } from "@/providers/user-provider";

type GenericModuleSettingsPageProps = {
  module: ModuleSettingsItem;
};

export function GenericModuleSettingsPage({
  module,
}: GenericModuleSettingsPageProps) {
  const { userData, isLoading } = useUser();
  const isTenantAdmin = Boolean(userData?.is_admin);

  if (isLoading) {
    return <SettingsContentSkeleton />;
  }

  if (!isTenantAdmin) {
    return (
      <SettingsPageLayout
        title={module.label}
        description={`${module.label} module settings are available to tenant administrators.`}
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
      title={module.label}
      description={module.description}
      className="max-w-3xl"
    >
      <div data-testid={`module-settings-page-${module.slug}`}>
        <ModuleSettingsEmptyState moduleLabel={module.label} />
      </div>
    </SettingsPageLayout>
  );
}

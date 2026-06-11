"use client";

import Link from "next/link";

import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import {
  SettingsPageLayout,
  SettingsSection,
} from "@/features/settings/components/SettingsPageLayout";
import { InventoryModuleSettingsTabs } from "@/features/settings/components/modules/inventory/InventoryModuleSettingsTabs";
import { ROUTES } from "@/constants/routes";
import { useUser } from "@/providers/user-provider";

export function InventoryModuleSettingsPage() {
  const { userData, isLoading } = useUser();
  const isTenantAdmin = Boolean(userData?.is_admin);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isTenantAdmin) {
    return (
      <SettingsPageLayout
        title="Inventory"
        description="Inventory module settings are available to tenant administrators."
      >
        <SettingsSection title="Access restricted">
          <div className="space-y-4">
            <p className="text-sm text-brand-muted">
              You need tenant administrator access to configure inventory settings.
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
      title="Inventory"
      description="Configure clinic-level inventory behaviour, approval workflows, and review approval history."
    >
      <InventoryModuleSettingsTabs />
    </SettingsPageLayout>
  );
}

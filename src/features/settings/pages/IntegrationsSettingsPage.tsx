"use client";

import Link from "next/link";

import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { IntegrationsSettingsGrid } from "@/features/settings/components/integrations/IntegrationsSettingsGrid";
import {
  SettingsPageLayout,
  SettingsSection,
} from "@/features/settings/components/SettingsPageLayout";
import { ROUTES } from "@/constants/routes";
import { useUser } from "@/providers/user-provider";

export function IntegrationsSettingsPage() {
  const { userData, isLoading } = useUser();
  const isTenantAdmin = Boolean(userData?.is_admin);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isTenantAdmin) {
    return (
      <SettingsPageLayout
        title="Integrations"
        description="Integration settings are available to tenant administrators."
      >
        <SettingsSection title="Access restricted">
          <div className="space-y-4">
            <p className="text-sm text-brand-muted">
              You need tenant administrator access to configure integrations.
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
      title="Integrations"
      description="Connect communication and insurance services for your organization."
    >
      <IntegrationsSettingsGrid />
    </SettingsPageLayout>
  );
}

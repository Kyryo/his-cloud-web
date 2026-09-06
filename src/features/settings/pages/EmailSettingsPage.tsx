"use client";

import Link from "next/link";

import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import { Button } from "@/components/ui/button";
import { EmailSettingsForm } from "@/features/settings/components/integrations/EmailSettingsForm";
import { SettingsPageLayout, SettingsSection } from "@/features/settings/components/SettingsPageLayout";
import { ROUTES } from "@/constants/routes";
import { useUser } from "@/providers/user-provider";

export function EmailSettingsPage() {
  const { userData, isLoading } = useUser();
  const isTenantAdmin = Boolean(userData?.is_admin);

  if (isLoading) {
    return <SettingsContentSkeleton variant="form" />;
  }

  if (!isTenantAdmin) {
    return (
      <SettingsPageLayout
        title="Email Settings"
        description="Email settings are available to tenant administrators."
      >
        <SettingsSection title="Access restricted">
          <div className="space-y-4">
            <p className="text-sm text-brand-muted">
              You need tenant administrator access to configure SMTP settings.
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
      title="Email Settings"
      description="Configure SMTP delivery for appointment notifications and other outbound email."
    >
      <EmailSettingsForm />
    </SettingsPageLayout>
  );
}

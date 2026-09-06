"use client";

import Link from "next/link";

import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import { Button } from "@/components/ui/button";
import { ClientTagsSettingsTab } from "@/features/settings/components/ClientTagsSettingsTab";
import {
  SettingsPageLayout,
  SettingsSection,
} from "@/features/settings/components/SettingsPageLayout";
import { ROUTES } from "@/constants/routes";
import { useUser } from "@/providers/user-provider";

export function ClientTagsSettingsPage() {
  const { userData, isLoading: isUserLoading } = useUser();
  const isTenantAdmin = Boolean(userData?.is_admin);

  if (isUserLoading) {
    return <SettingsContentSkeleton />;
  }

  if (!isTenantAdmin) {
    return (
      <SettingsPageLayout
        title="Client tags"
        description="Client tag settings are available to tenant administrators."
      >
        <SettingsSection title="Access restricted">
          <div className="space-y-4">
            <p className="text-sm text-brand-muted">
              You need tenant administrator permissions to manage the client tag
              catalog. Contact your administrator if you believe this is a mistake.
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
      title="Client tags"
      description="Define the tags staff can assign to clients and use when filtering lists."
      className="max-w-3xl"
    >
      <ClientTagsSettingsTab isActive />
    </SettingsPageLayout>
  );
}

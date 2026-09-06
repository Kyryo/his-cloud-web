"use client";

import Link from "next/link";

import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import { Button } from "@/components/ui/button";
import { ClinicalStaffRolesSection } from "@/features/settings/components/ClinicalStaffRolesSection";
import {
  SettingsPageLayout,
  SettingsSection,
} from "@/features/settings/components/SettingsPageLayout";
import { ROUTES } from "@/constants/routes";
import { useUser } from "@/providers/user-provider";

export function ClinicalProvidersSettingsPage() {
  const { userData, isLoading: isUserLoading } = useUser();
  const isTenantAdmin = Boolean(userData?.is_admin);

  if (isUserLoading) {
    return <SettingsContentSkeleton variant="staff" />;
  }

  if (!isTenantAdmin) {
    return (
      <SettingsPageLayout
        title="Providers"
        description="Manage clinical staff assignments for the EMR workspace."
      >
        <SettingsSection title="Access restricted">
          <div className="space-y-4">
            <p className="text-sm text-brand-muted">
              Tenant administrator permissions are required to manage providers.
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
      title="Providers"
      description="Assign nurses and physicians. Provider roles determine which OPD workspace tabs each user can access."
      className="max-w-3xl"
    >
      <ClinicalStaffRolesSection />
    </SettingsPageLayout>
  );
}

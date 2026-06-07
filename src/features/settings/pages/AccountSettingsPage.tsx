"use client";

import { PageLoader } from "@/components/page-loader";
import { AccountProfileForm } from "@/features/settings/components/AccountProfileForm";
import { AssignedClinicsTable } from "@/features/settings/components/AssignedClinicsTable";
import {
  SettingsPageLayout,
  SettingsSection,
} from "@/features/settings/components/SettingsPageLayout";
import { useUser } from "@/providers/user-provider";

export function AccountSettingsPage() {
  const { userData, isLoading } = useUser();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!userData) {
    return (
      <SettingsPageLayout
        title="Account"
        description="Manage your personal profile and clinic assignments."
      >
        <SettingsSection title="Unable to load account">
          <p className="text-sm text-brand-muted">
            We could not load your account details. Try signing in again.
          </p>
        </SettingsSection>
      </SettingsPageLayout>
    );
  }

  return (
    <SettingsPageLayout
      title="Account"
      description="Manage your personal profile and see which clinics you can access."
    >
      <SettingsSection
        title="Profile"
        description="Update how your name appears across the platform."
      >
        <AccountProfileForm user={userData} />
      </SettingsSection>

      <SettingsSection
        title="Assigned clinics"
        description="Clinics linked to your account and your role at each location."
      >
        <AssignedClinicsTable clinics={userData.clinics ?? []} />
      </SettingsSection>
    </SettingsPageLayout>
  );
}

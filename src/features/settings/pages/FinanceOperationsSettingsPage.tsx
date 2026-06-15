"use client";

import Link from "next/link";

import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { FinanceOperationsSettingsTabs } from "@/features/settings/components/FinanceOperationsSettingsTabs";
import {
  SettingsPageLayout,
  SettingsSection,
} from "@/features/settings/components/SettingsPageLayout";
import { ROUTES } from "@/constants/routes";
import { useUser } from "@/providers/user-provider";

export function FinanceOperationsSettingsPage() {
  const { userData, isLoading: isUserLoading } = useUser();
  const isTenantAdmin = Boolean(userData?.is_admin);

  if (isUserLoading) {
    return <PageLoader />;
  }

  if (!isTenantAdmin) {
    return (
      <SettingsPageLayout
        title="Finance & Operations"
        description="Finance and operations settings are available to tenant administrators."
      >
        <SettingsSection title="Access restricted">
          <div className="space-y-4">
            <p className="text-sm text-brand-muted">
              You need tenant administrator permissions to manage payers and payer
              schemes. Contact your administrator if you believe this is a mistake.
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
      title="Finance & Operations"
      description="Manage payers, insurance schemes, and ERP pricelists for billing."
    >
      <FinanceOperationsSettingsTabs />
    </SettingsPageLayout>
  );
}

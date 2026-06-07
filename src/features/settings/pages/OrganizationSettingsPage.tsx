"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { OrganizationSettingsTabs } from "@/features/settings/components/OrganizationSettingsTabs";
import {
  SettingsPageLayout,
  SettingsSection,
} from "@/features/settings/components/SettingsPageLayout";
import { fetchOrganization } from "@/features/settings/services/settings.service";
import type { TenantDetail } from "@/features/settings/types/settings.types";
import { ROUTES } from "@/constants/routes";
import { useUser } from "@/providers/user-provider";

export function OrganizationSettingsPage() {
  const { userData, isLoading: isUserLoading } = useUser();
  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isTenantAdmin = Boolean(userData?.is_admin);

  useEffect(() => {
    if (isUserLoading || !isTenantAdmin) {
      return;
    }

    let active = true;

    async function loadOrganization() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchOrganization();
        if (active) {
          setTenant(data);
        }
      } catch (loadError) {
        if (active) {
          setTenant(null);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load organization details.",
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadOrganization();

    return () => {
      active = false;
    };
  }, [isTenantAdmin, isUserLoading]);

  if (isUserLoading) {
    return <PageLoader />;
  }

  if (isTenantAdmin && isLoading) {
    return <PageLoader />;
  }

  if (!isTenantAdmin) {
    return (
      <SettingsPageLayout
        title="Organization"
        description="Organization settings are available to tenant administrators."
      >
        <SettingsSection title="Access restricted">
          <div className="space-y-4">
            <p className="text-sm text-brand-muted">
              You need tenant administrator permissions to view organization
              details. Contact your administrator if you believe this is a mistake.
            </p>
            <Button asChild variant="outline">
              <Link href={ROUTES.settingsAccount}>Back to account settings</Link>
            </Button>
          </div>
        </SettingsSection>
      </SettingsPageLayout>
    );
  }

  if (error || !tenant) {
    return (
      <SettingsPageLayout
        title="Organization"
        description="Review your organization profile and operational footprint."
      >
        <SettingsSection title="Unable to load organization">
          <p className="text-sm text-brand-muted">
            {error ?? "Organization details are unavailable right now."}
          </p>
        </SettingsSection>
      </SettingsPageLayout>
    );
  }

  return (
    <SettingsPageLayout
      title="Organization"
      description="Review your organization profile, contact details, and operational footprint."
    >
      <OrganizationSettingsTabs tenant={tenant} onTenantUpdated={setTenant} />
    </SettingsPageLayout>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import {
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
} from "@/features/app-shell/components/page-layout";
import {
  MasmEclaimsSettingsForm,
  loadMasemPayerIntegration,
} from "@/features/settings/components/integrations/MasmEclaimsSettingsForm";
import { EclaimsPractitionerMappingsPanel } from "@/features/settings/components/integrations/EclaimsPractitionerMappingsPanel";
import {
  SettingsPageLayout,
  SettingsSection,
} from "@/features/settings/components/SettingsPageLayout";
import { ROUTES } from "@/constants/routes";
import type { MasmPayerIntegration } from "@/features/claims/types/claims.types";
import { useUser } from "@/providers/user-provider";

type MasmTabId = "connection" | "practitioners";

const tabs: Array<{ id: MasmTabId; label: string }> = [
  { id: "connection", label: "Connection" },
  { id: "practitioners", label: "Practitioner mappings" },
];

function resolveTab(value: string | null): MasmTabId {
  return value === "practitioners" ? "practitioners" : "connection";
}

export function MasmEclaimsSettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userData, isLoading: isUserLoading } = useUser();
  const isTenantAdmin = Boolean(userData?.is_admin);
  const [integration, setIntegration] = useState<MasmPayerIntegration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activeTab = resolveTab(searchParams.get("tab"));

  useEffect(() => {
    if (!isTenantAdmin) {
      setIsLoading(false);
      return;
    }

    let active = true;

    void (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await loadMasemPayerIntegration();
        if (active) {
          setIntegration(data);
        }
      } catch (loadError) {
        if (active) {
          setIntegration(null);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load MASM integration settings.",
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [isTenantAdmin]);

  function setActiveTab(tab: MasmTabId) {
    const query = tab === "connection" ? "" : `?tab=${tab}`;
    router.replace(`${ROUTES.settingsIntegrationsMasemEclaims}${query}`);
  }

  if (isUserLoading) {
    return <PageLoader />;
  }

  if (!isTenantAdmin) {
    return (
      <SettingsPageLayout
        title="MASM eClaims"
        description="MASM integration settings are available to tenant administrators."
      >
        <SettingsSection title="Access restricted">
          <div className="space-y-4">
            <p className="text-sm text-brand-muted">
              You need tenant administrator access to configure MASM.
            </p>
            <Button asChild variant="outline">
              <Link href={ROUTES.settingsIntegrations}>Back to integrations</Link>
            </Button>
          </div>
        </SettingsSection>
      </SettingsPageLayout>
    );
  }

  return (
    <SettingsPageLayout
      title="MASM eClaims"
      description="Configure payer credentials and practitioner mappings for electronic claims in Malawi."
    >
      <div className="w-full max-w-[75%] overflow-hidden rounded-xl border border-brand-border bg-white">
        <DetailPageTabsNavSection aria-label="MASM integration sections">
          {tabs.map((tab) => (
            <DetailPageTabNavItem
              key={tab.id}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </DetailPageTabNavItem>
          ))}
        </DetailPageTabsNavSection>

        <div className="px-6 py-6">
          {activeTab === "connection" ? (
            isLoading ? (
              <PageLoader />
            ) : error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : integration ? (
              <MasmEclaimsSettingsForm
                integration={integration}
                onUpdated={setIntegration}
              />
            ) : null
          ) : (
            <EclaimsPractitionerMappingsPanel />
          )}
        </div>
      </div>
    </SettingsPageLayout>
  );
}

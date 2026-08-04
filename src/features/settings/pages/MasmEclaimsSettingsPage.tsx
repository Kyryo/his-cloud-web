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
  loadMasemClinicSettings,
} from "@/features/settings/components/integrations/MasmEclaimsSettingsForm";
import { EclaimsPractitionerMappingsPanel } from "@/features/settings/components/integrations/EclaimsPractitionerMappingsPanel";
import {
  SettingsPageLayout,
  SettingsSection,
} from "@/features/settings/components/SettingsPageLayout";
import { ROUTES } from "@/constants/routes";
import type {
  MasmPayerIntegration,
  MasmPortalCredential,
} from "@/features/claims/types/claims.types";
import { fetchOrganizationClinics } from "@/features/settings/services/settings.service";
import type { OrganizationClinic } from "@/features/settings/types/settings.types";
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
  const [clinics, setClinics] = useState<OrganizationClinic[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<number | null>(null);
  const [integration, setIntegration] = useState<MasmPayerIntegration | null>(null);
  const [credential, setCredential] = useState<MasmPortalCredential | null>(null);
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
        const clinicResponse = await fetchOrganizationClinics();
        if (!active) {
          return;
        }
        setClinics(clinicResponse.results);
        const firstClinicId = clinicResponse.results[0]?.id ?? null;
        setSelectedClinicId((current) => current ?? firstClinicId);
      } catch (loadError) {
        if (active) {
          setClinics([]);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load clinics for MASM settings.",
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

  useEffect(() => {
    if (!isTenantAdmin || selectedClinicId == null || activeTab !== "connection") {
      return;
    }

    let active = true;

    void (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await loadMasemClinicSettings(selectedClinicId);
        if (active) {
          setIntegration(data.integration);
          setCredential(data.credential);
        }
      } catch (loadError) {
        if (active) {
          setIntegration(null);
          setCredential(null);
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
  }, [activeTab, isTenantAdmin, selectedClinicId]);

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
      description="Configure clinic-scoped payer credentials and practitioner mappings for electronic claims in Malawi."
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
            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-brand-navy">Clinic</span>
                <select
                  className="w-full rounded-md border border-brand-border bg-white px-3 py-2 text-sm"
                  value={selectedClinicId ?? ""}
                  onChange={(event) =>
                    setSelectedClinicId(
                      event.target.value ? Number(event.target.value) : null,
                    )
                  }
                >
                  {clinics.length === 0 ? (
                    <option value="">No clinics available</option>
                  ) : null}
                  {clinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </option>
                  ))}
                </select>
              </label>

              {isLoading ? (
                <PageLoader />
              ) : error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : selectedClinicId && integration ? (
                <MasmEclaimsSettingsForm
                  clinicId={selectedClinicId}
                  integration={integration}
                  credential={credential}
                  onUpdated={({ integration: nextIntegration, credential: nextCredential }) => {
                    setIntegration(nextIntegration);
                    setCredential(nextCredential);
                  }}
                />
              ) : null}
            </div>
          ) : (
            <EclaimsPractitionerMappingsPanel />
          )}
        </div>
      </div>
    </SettingsPageLayout>
  );
}

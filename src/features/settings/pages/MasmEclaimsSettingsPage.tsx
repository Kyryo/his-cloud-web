"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AppIcon } from "@/components/icons/app-icon";
import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import { Button } from "@/components/ui/button";
import { MasmClinicSettingsSheet } from "@/features/settings/components/integrations/MasmClinicSettingsSheet";
import { EclaimsPractitionerMappingsPanel } from "@/features/settings/components/integrations/EclaimsPractitionerMappingsPanel";
import {
  SettingsPageLayout,
  SettingsSection,
  SettingsUnderlineTabs,
} from "@/features/settings/components/SettingsPageLayout";
import { ROUTES } from "@/constants/routes";
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

function clinicMeta(clinic: OrganizationClinic) {
  const locationLabel =
    clinic.location_count === 1
      ? "1 location"
      : `${clinic.location_count} locations`;

  return [clinic.code, locationLabel, clinic.operating_hours_display]
    .filter((value) => Boolean(value))
    .join(" · ");
}

export function MasmEclaimsSettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userData, isLoading: isUserLoading } = useUser();
  const isTenantAdmin = Boolean(userData?.is_admin);
  const [clinics, setClinics] = useState<OrganizationClinic[]>([]);
  const [selectedClinic, setSelectedClinic] =
    useState<OrganizationClinic | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const activeTab = resolveTab(searchParams.get("tab"));

  useEffect(() => {
    if (!isTenantAdmin) {
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

  function setActiveTab(tab: MasmTabId) {
    const query = tab === "connection" ? "" : `?tab=${tab}`;
    router.replace(`${ROUTES.settingsIntegrationsMasemEclaims}${query}`);
  }

  if (isUserLoading) {
    return <SettingsContentSkeleton />;
  }

  if (!isTenantAdmin) {
    return (
      <SettingsPageLayout
        title="MASM eClaims"
        description="MASM integration settings are available to tenant administrators."
      >
        <SettingsSection title="Access restricted">
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
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
      className="max-w-3xl"
    >
      <SettingsUnderlineTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        ariaLabel="MASM integration sections"
      />

      <div className="pt-8">
        {activeTab === "connection" ? (
          <div className="space-y-5">
            <p className="max-w-xl text-sm text-slate-400">
              Open a clinic to set its MASM Integration API and portal automation.
            </p>

            {isLoading ? (
              <SettingsContentSkeleton rows={4} showHeader={false} />
            ) : error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : clinics.length === 0 ? (
              <p className="text-sm text-slate-400">
                No clinics are available for this organization yet.
              </p>
            ) : (
              <ul className="divide-y divide-brand-border">
                {clinics.map((clinic) => (
                  <li key={clinic.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClinic(clinic);
                        setSheetOpen(true);
                      }}
                      className="flex w-full items-center gap-3 py-3.5 text-left"
                      data-testid={`masm-clinic-row-${clinic.id}`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-brand-navy">
                          {clinic.name}
                        </p>
                        <p className="mt-0.5 truncate text-sm text-slate-400">
                          {clinicMeta(clinic)}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-slate-400">
                        {clinic.is_active ? "Active" : "Inactive"}
                      </span>
                      <AppIcon
                        name="chevronRight"
                        size={16}
                        className="shrink-0 text-slate-300"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <EclaimsPractitionerMappingsPanel />
        )}
      </div>

      <MasmClinicSettingsSheet
        clinic={selectedClinic}
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) {
            setSelectedClinic(null);
          }
        }}
      />
    </SettingsPageLayout>
  );
}

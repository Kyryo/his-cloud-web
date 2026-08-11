"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { PageLoader } from "@/components/page-loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
} from "@/features/app-shell/components/page-layout";
import { MasmClinicSettingsSheet } from "@/features/settings/components/integrations/MasmClinicSettingsSheet";
import { EclaimsPractitionerMappingsPanel } from "@/features/settings/components/integrations/EclaimsPractitionerMappingsPanel";
import {
  SettingsPageLayout,
  SettingsSection,
} from "@/features/settings/components/SettingsPageLayout";
import { ROUTES } from "@/constants/routes";
import { fetchOrganizationClinics } from "@/features/settings/services/settings.service";
import type { OrganizationClinic } from "@/features/settings/types/settings.types";
import { cn } from "@/lib/utils";
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
  const [selectedClinic, setSelectedClinic] =
    useState<OrganizationClinic | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
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

  function handleClinicClick(clinic: OrganizationClinic) {
    setSelectedClinic(clinic);
    setSheetOpen(true);
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
      <div className="w-full overflow-hidden rounded-xl border border-brand-border bg-white">
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
              <div>
                <h2 className="text-sm font-semibold text-brand-navy">Clinics</h2>
                <p className="mt-0.5 text-xs text-brand-muted">
                  Select a clinic to configure its MASM connection settings.
                </p>
              </div>

              {isLoading ? (
                <PageLoader />
              ) : error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : clinics.length === 0 ? (
                <p className="py-8 text-center text-sm text-brand-muted">
                  No clinics are available for this organization yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {clinics.map((clinic) => (
                    <button
                      key={clinic.id}
                      type="button"
                      onClick={() => handleClinicClick(clinic)}
                      className={cn(
                        "group flex w-full items-center gap-3 rounded-lg border border-brand-border bg-white px-4 py-3 text-left transition-colors",
                        "hover:border-brand-primary/40 hover:bg-brand-tint/30",
                      )}
                      data-testid={`masm-clinic-row-${clinic.id}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-sm font-medium text-brand-navy">
                            {clinic.name}
                          </h3>
                          <Badge
                            variant={clinic.is_active ? "default" : "outline"}
                            className="capitalize"
                          >
                            {clinic.status.replace(/_/g, " ").toLowerCase()}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-brand-muted">
                          {clinic.code}
                          {clinic.location_count != null
                            ? ` · ${clinic.location_count} location${clinic.location_count === 1 ? "" : "s"}`
                            : null}
                        </p>
                      </div>
                      <ChevronRight
                        className="size-4 shrink-0 text-brand-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand-primary"
                        aria-hidden="true"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <EclaimsPractitionerMappingsPanel />
          )}
        </div>
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

"use client";

import { useEffect, useState } from "react";

import { PageLoader } from "@/components/page-loader";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DetailPageTabNavItem,
  DetailPageTabsNavSection,
} from "@/features/app-shell/components/page-layout";
import {
  MasmIntegrationSettingsForm,
  MasmPortalAutomationForm,
  loadMasemClinicSettings,
} from "@/features/settings/components/integrations/MasmEclaimsSettingsForm";
import type {
  MasmPayerIntegration,
  MasmPortalCredential,
} from "@/features/claims/types/claims.types";
import type { OrganizationClinic } from "@/features/settings/types/settings.types";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

type SheetTabId = "integration" | "portal";

const sheetTabs: Array<{ id: SheetTabId; label: string }> = [
  { id: "integration", label: "Integration settings" },
  { id: "portal", label: "Portal automation" },
];

type MasmClinicSettingsSheetProps = {
  clinic: OrganizationClinic | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function MasmClinicSettingsSheet({
  clinic,
  open,
  onOpenChange,
}: MasmClinicSettingsSheetProps) {
  const [activeTab, setActiveTab] = useState<SheetTabId>("integration");
  const [integration, setIntegration] = useState<MasmPayerIntegration | null>(
    null,
  );
  const [credential, setCredential] = useState<MasmPortalCredential | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setActiveTab("integration");
      return;
    }
    if (clinic == null) {
      return;
    }

    let active = true;

    void (async () => {
      try {
        setIsLoading(true);
        setError(null);
        setIntegration(null);
        setCredential(null);
        const data = await loadMasemClinicSettings(clinic.id);
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
  }, [clinic, open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className={cn(
          "flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg",
          appFont.className,
        )}
        data-testid="masm-clinic-settings-sheet"
      >
        <SheetHeader className="border-b border-brand-border px-6 py-5 text-left">
          <SheetTitle>{clinic?.name ?? "Clinic settings"}</SheetTitle>
          <SheetDescription>
            Configure MASM Integration API and portal automation for this clinic.
          </SheetDescription>
        </SheetHeader>

        <DetailPageTabsNavSection aria-label="Clinic MASM settings sections">
          {sheetTabs.map((tab) => (
            <DetailPageTabNavItem
              key={tab.id}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </DetailPageTabNavItem>
          ))}
        </DetailPageTabsNavSection>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isLoading ? (
            <PageLoader />
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : clinic && integration ? (
            activeTab === "integration" ? (
              <MasmIntegrationSettingsForm
                clinicId={clinic.id}
                integration={integration}
                onUpdated={setIntegration}
              />
            ) : (
              <MasmPortalAutomationForm
                clinicId={clinic.id}
                credential={credential}
                onUpdated={setCredential}
              />
            )
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

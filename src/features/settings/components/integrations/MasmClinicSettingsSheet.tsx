"use client";

import { useEffect, useState } from "react";

import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SettingsUnderlineTabs } from "@/features/settings/components/SettingsPageLayout";
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
  { id: "integration", label: "Integration" },
  { id: "portal", label: "Portal" },
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
          setActiveTab("integration");
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
            MASM Integration API and portal automation for this clinic.
          </SheetDescription>
        </SheetHeader>

        <div className="px-6">
          <SettingsUnderlineTabs
            tabs={sheetTabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            ariaLabel="Clinic MASM settings sections"
          />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isLoading ? (
            <SettingsContentSkeleton rows={5} showHeader={false} />
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : clinic && integration ? (
            activeTab === "integration" ? (
              <MasmIntegrationSettingsForm
                key={`${clinic.id}-integration-${integration.updated_at}`}
                clinicId={clinic.id}
                integration={integration}
                onUpdated={setIntegration}
              />
            ) : (
              <MasmPortalAutomationForm
                key={`${clinic.id}-portal-${credential?.updated_at ?? "new"}`}
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

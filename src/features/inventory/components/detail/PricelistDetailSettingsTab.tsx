"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  PageActionButton,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/app-buttons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  fetchCatalogPricelistSettings,
  startCatalogMasmCorePriceSync,
} from "@/features/catalog/services/catalog.service";
import type {
  CatalogPricelist,
  CatalogPricelistSettings,
} from "@/features/catalog/types/catalog.types";
import { PricelistMasmSyncJobPanel } from "@/features/inventory/components/detail/PricelistMasmSyncJobPanel";
import {
  SettingsFieldRow,
  SettingsPanelSection,
} from "@/features/settings/components/SettingsPageLayout";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { appFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { useToast } from "@/providers/toast-provider";
import { useUser } from "@/providers/user-provider";

type PricelistDetailSettingsTabProps = {
  pricelist: CatalogPricelist;
  isActive: boolean;
};

type SyncDraft = {
  updateFixedPrice: boolean;
  updateName: boolean;
  importMissingTariffs: boolean;
  updateValidity: boolean;
  dateStart: string;
  dateEnd: string;
};

const DEFAULT_SYNC_DRAFT: SyncDraft = {
  updateFixedPrice: true,
  updateName: false,
  importMissingTariffs: false,
  updateValidity: false,
  dateStart: "",
  dateEnd: "",
};

export function PricelistDetailSettingsTab({
  pricelist,
  isActive,
}: PricelistDetailSettingsTabProps) {
  const { toast } = useToast();
  const { userData } = useUser();
  const isTenantAdmin = Boolean(userData?.is_admin);
  const [settings, setSettings] = useState<CatalogPricelistSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [syncDraft, setSyncDraft] = useState<SyncDraft>(DEFAULT_SYNC_DRAFT);
  const [isStarting, setIsStarting] = useState(false);
  const [activeJobUuid, setActiveJobUuid] = useState<string | null>(null);
  const [activeToastId, setActiveToastId] = useState<string | number | null>(null);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      setError(null);
      const payload = await fetchCatalogPricelistSettings(pricelist.uuid);
      setSettings(payload);
    } catch (err) {
      setSettings(null);
      setError(err instanceof Error ? err.message : "Failed to load settings.");
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, [pricelist.uuid]);

  useEffect(() => {
    if (!isActive) {
      return;
    }
    void loadSettings();
  }, [isActive, loadSettings]);

  async function handleStartSync() {
    if (
      !syncDraft.updateFixedPrice &&
      !syncDraft.updateName &&
      !syncDraft.importMissingTariffs &&
      !syncDraft.updateValidity
    ) {
      toast({
        variant: "error",
        title: "Select at least one option",
        description: "Choose what to update from MASM Core before starting.",
      });
      return;
    }
    if (
      syncDraft.updateValidity &&
      syncDraft.dateStart &&
      syncDraft.dateEnd &&
      syncDraft.dateStart > syncDraft.dateEnd
    ) {
      toast({
        variant: "error",
        title: "Invalid validity dates",
        description: "Valid to must be on or after valid from.",
      });
      return;
    }

    setIsStarting(true);
    try {
      const job = await startCatalogMasmCorePriceSync(pricelist.uuid, {
        update_fixed_price: syncDraft.updateFixedPrice,
        update_name: syncDraft.updateName,
        import_missing_tariffs: syncDraft.importMissingTariffs,
        update_validity: syncDraft.updateValidity,
        date_start: syncDraft.updateValidity
          ? syncDraft.dateStart || null
          : undefined,
        date_end: syncDraft.updateValidity ? syncDraft.dateEnd || null : undefined,
      });
      setConfirmOpen(false);
      const toastId = toast({
        variant: "loading",
        title: "Syncing from MASM Core",
        description: "Applying selected tariff updates…",
      });
      setActiveJobUuid(job.uuid);
      setActiveToastId(toastId);
    } catch (err) {
      toast({
        variant: "error",
        title: "Could not start MASM Core sync",
        description:
          err instanceof BffError
            ? formatBffErrorMessage(err.message, err.errors)
            : err instanceof Error
              ? err.message
              : "Something went wrong.",
      });
    } finally {
      setIsStarting(false);
    }
  }

  if (!isActive) {
    return null;
  }

  if (isLoading && !hasLoaded) {
    return (
      <div
        className="flex items-center gap-2 py-10 text-sm text-brand-muted"
        data-testid="pricelist-settings-tab-skeleton"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Loading settings…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        <p>{error}</p>
        <SecondaryButton type="button" className="mt-4" onClick={() => void loadSettings()}>
          Try again
        </SecondaryButton>
      </div>
    );
  }

  const schemes = settings?.schemes ?? [];
  const coreProviderId = settings?.core_provider_id ?? null;
  const canResolveProvider = coreProviderId != null;
  const syncDisabledReason = !isTenantAdmin
    ? "You don't have permissions to run a sync."
    : !canResolveProvider
      ? "Add a service provider code on a linked practitioner mapping."
      : activeJobUuid
        ? "A sync is already in progress."
        : null;
  const syncEnabled = syncDisabledReason == null;

  return (
    <div className="max-w-3xl space-y-8" data-testid="pricelist-settings-tab">
      {activeJobUuid ? (
        <PricelistMasmSyncJobPanel
          pricelistUuid={pricelist.uuid}
          jobUuid={activeJobUuid}
          syncToastId={activeToastId ?? undefined}
          onTerminal={() => {
            void loadSettings();
          }}
          onDismiss={() => {
            setActiveJobUuid(null);
            setActiveToastId(null);
          }}
        />
      ) : null}

      <SettingsPanelSection
        title="Scheme mapping"
        description="Insurance schemes linked to this pricelist."
      >
        {schemes.length === 0 ? (
          <p className="text-sm text-slate-400">
            No insurance schemes are linked to this pricelist yet.
          </p>
        ) : (
          <div className="divide-y divide-brand-border border-y border-brand-border">
            {schemes.map((scheme) => (
              <div key={scheme.uuid} className="space-y-0 py-1">
                <SettingsFieldRow label="Scheme">{scheme.name}</SettingsFieldRow>
                <SettingsFieldRow label="Company">
                  {scheme.company_name || "—"}
                </SettingsFieldRow>
                <SettingsFieldRow label="Code">{scheme.code || "—"}</SettingsFieldRow>
                <SettingsFieldRow label="Status">
                  {scheme.is_active ? "Active" : "Inactive"}
                </SettingsFieldRow>
              </div>
            ))}
          </div>
        )}
      </SettingsPanelSection>

      <SettingsPanelSection
        title="MASM Core sync"
        description="Update this pricelist from MASM Core tariffs."
        action={
          <div className="flex flex-col items-end gap-1">
            <PageActionButton
              type="button"
              disabled={!syncEnabled || isStarting}
              onClick={() => {
                setSyncDraft(DEFAULT_SYNC_DRAFT);
                setConfirmOpen(true);
              }}
              data-testid="pricelist-masm-sync-button"
            >
              Update from MASM Core
            </PageActionButton>
            {syncDisabledReason ? (
              <p
                className="max-w-xs text-right text-xs text-slate-400"
                data-testid="pricelist-masm-sync-hint"
              >
                {syncDisabledReason}
              </p>
            ) : coreProviderId != null ? (
              <p className="text-xs text-slate-400">Provider id {coreProviderId}</p>
            ) : null}
          </div>
        }
      >
        <p className="text-sm text-slate-400">
          Choose whether to update prices, product names, validity dates, and whether to
          import Core tariffs that are not yet in HMIS.
        </p>
      </SettingsPanelSection>

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open && !isStarting) {
            setConfirmOpen(false);
          }
        }}
      >
        <DialogContent className={cn("sm:max-w-lg", appFont.className)}>
          <DialogHeader>
            <DialogTitle>Update from MASM Core</DialogTitle>
            <DialogDescription>
              Match by scheme tariff code
              {coreProviderId != null ? ` (provider ${coreProviderId})` : ""}. Select what
              to apply.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1" data-testid="pricelist-masm-sync-options">
            <label className="flex items-start gap-3 text-sm text-brand-navy">
              <input
                type="checkbox"
                className="mt-0.5 size-4 rounded border-brand-border"
                checked={syncDraft.updateFixedPrice}
                disabled={isStarting}
                onChange={(event) =>
                  setSyncDraft((current) => ({
                    ...current,
                    updateFixedPrice: event.target.checked,
                  }))
                }
              />
              <span>
                <span className="font-medium">Update fixed prices</span>
                <span className="mt-0.5 block text-slate-400">
                  Set pricelist fixed price from the Core tariff value.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 text-sm text-brand-navy">
              <input
                type="checkbox"
                className="mt-0.5 size-4 rounded border-brand-border"
                checked={syncDraft.updateName}
                disabled={isStarting}
                onChange={(event) =>
                  setSyncDraft((current) => ({
                    ...current,
                    updateName: event.target.checked,
                  }))
                }
              />
              <span>
                <span className="font-medium">Update product names</span>
                <span className="mt-0.5 block text-slate-400">
                  Rename matched products using the Core tariff description.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 text-sm text-brand-navy">
              <input
                type="checkbox"
                className="mt-0.5 size-4 rounded border-brand-border"
                checked={syncDraft.importMissingTariffs}
                disabled={isStarting}
                onChange={(event) =>
                  setSyncDraft((current) => ({
                    ...current,
                    importMissingTariffs: event.target.checked,
                  }))
                }
              />
              <span>
                <span className="font-medium">Import missing tariffs</span>
                <span className="mt-0.5 block text-slate-400">
                  Create products for Core tariffs not in HMIS and add them to this
                  pricelist.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 text-sm text-brand-navy">
              <input
                type="checkbox"
                className="mt-0.5 size-4 rounded border-brand-border"
                checked={syncDraft.updateValidity}
                disabled={isStarting}
                onChange={(event) =>
                  setSyncDraft((current) => ({
                    ...current,
                    updateValidity: event.target.checked,
                  }))
                }
              />
              <span>
                <span className="font-medium">Update valid from / valid to</span>
                <span className="mt-0.5 block text-slate-400">
                  Apply the dates below to synced pricelist rows.
                </span>
              </span>
            </label>

            {syncDraft.updateValidity ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="masm-sync-date-start">Valid from</Label>
                  <Input
                    id="masm-sync-date-start"
                    type="date"
                    value={syncDraft.dateStart}
                    disabled={isStarting}
                    onChange={(event) =>
                      setSyncDraft((current) => ({
                        ...current,
                        dateStart: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="masm-sync-date-end">Valid to</Label>
                  <Input
                    id="masm-sync-date-end"
                    type="date"
                    value={syncDraft.dateEnd}
                    disabled={isStarting}
                    onChange={(event) =>
                      setSyncDraft((current) => ({
                        ...current,
                        dateEnd: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <SecondaryButton
              type="button"
              disabled={isStarting}
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="button"
              disabled={isStarting}
              onClick={() => void handleStartSync()}
            >
              {isStarting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Starting…
                </>
              ) : (
                "Start sync"
              )}
            </PrimaryButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

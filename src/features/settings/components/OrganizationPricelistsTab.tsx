"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import { Button } from "@/components/ui/button";
import { AddPricelistDialog } from "@/features/settings/components/AddPricelistDialog";
import { SettingsPanelSection } from "@/features/settings/components/SettingsPageLayout";
import { UpdatePricelistDialog } from "@/features/settings/components/UpdatePricelistDialog";
import {
  fetchOrganizationDefaultPricelist,
  fetchOrganizationPricelists,
  setOrganizationDefaultPricelist,
} from "@/features/settings/services/settings.service";
import type { OrganizationPricelist } from "@/features/settings/types/settings.types";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { useToast } from "@/providers/toast-provider";

type OrganizationPricelistsTabProps = {
  isActive: boolean;
};

function pricelistMeta(
  pricelist: OrganizationPricelist,
  isDefault: boolean,
) {
  const parts = [pricelist.currency_code];
  if (isDefault) {
    parts.push("Default");
  }
  return parts.filter((value) => Boolean(value)).join(" · ");
}

export function OrganizationPricelistsTab({
  isActive,
}: OrganizationPricelistsTabProps) {
  const { toast } = useToast();
  const [pricelists, setPricelists] = useState<OrganizationPricelist[]>([]);
  const [defaultPricelistUuid, setDefaultPricelistUuid] = useState<string | null>(
    null,
  );
  const [settingDefaultUuid, setSettingDefaultUuid] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingPricelist, setEditingPricelist] =
    useState<OrganizationPricelist | null>(null);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    let active = true;

    async function loadPricelists() {
      setIsLoading(true);
      setError(null);

      try {
        const [pricelistResponse, defaultResponse] = await Promise.all([
          fetchOrganizationPricelists(),
          fetchOrganizationDefaultPricelist(),
        ]);
        if (active) {
          setPricelists(pricelistResponse.results);
          setDefaultPricelistUuid(defaultResponse.default_pricelist_uuid);
        }
      } catch (loadError) {
        if (active) {
          setPricelists([]);
          setDefaultPricelistUuid(null);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load pricelists.",
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadPricelists();

    return () => {
      active = false;
    };
  }, [isActive, reloadToken]);

  if (!isActive) {
    return null;
  }

  function handleCreated(_pricelist: OrganizationPricelist) {
    setReloadToken((current) => current + 1);
  }

  function handleUpdated(updatedPricelist: OrganizationPricelist) {
    setPricelists((current) =>
      current.map((pricelist) =>
        pricelist.uuid === updatedPricelist.uuid ? updatedPricelist : pricelist,
      ),
    );
  }

  function handleArchived(pricelistUuid: string) {
    setPricelists((current) =>
      current.map((pricelist) =>
        pricelist.uuid === pricelistUuid
          ? { ...pricelist, is_active: false }
          : pricelist,
      ),
    );
    if (defaultPricelistUuid === pricelistUuid) {
      setDefaultPricelistUuid(null);
    }
  }

  async function handleSetDefault(pricelist: OrganizationPricelist) {
    setSettingDefaultUuid(pricelist.uuid);

    try {
      const response = await setOrganizationDefaultPricelist({
        default_pricelist_uuid: pricelist.uuid,
      });
      setDefaultPricelistUuid(response.default_pricelist_uuid);
      toast({
        variant: "success",
        title: "Default pricelist updated",
        description: `${pricelist.name} is now the organization default.`,
      });
    } catch (setDefaultError) {
      toast({
        variant: "error",
        title: "Could not set default pricelist",
        description:
          setDefaultError instanceof BffError
            ? formatBffErrorMessage(setDefaultError.message, setDefaultError.errors)
            : setDefaultError instanceof Error
              ? setDefaultError.message
              : "Something went wrong.",
      });
    } finally {
      setSettingDefaultUuid(null);
    }
  }

  return (
    <>
      <SettingsPanelSection
        title="Pricelists"
        description="Tariffs used for cash billing and payer scheme rates."
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAddDialogOpen(true)}
          >
            Add pricelist
          </Button>
        }
      >
        {isLoading ? (
          <SettingsContentSkeleton rows={4} showHeader={false} />
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : pricelists.length === 0 ? (
          <p className="text-sm text-slate-400">
            No pricelists yet. Add a tariff to use on cash and insurance invoices.
          </p>
        ) : (
          <ul className="divide-y divide-brand-border">
            {pricelists.map((pricelist) => {
              const isDefault = defaultPricelistUuid === pricelist.uuid;
              const isSettingDefault = settingDefaultUuid === pricelist.uuid;
              const meta = pricelistMeta(pricelist, isDefault);

              return (
                <li
                  key={pricelist.uuid}
                  className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-brand-navy">
                      {pricelist.name}
                    </p>
                    {meta ? (
                      <p className="mt-0.5 truncate text-sm text-slate-400">
                        {meta}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-slate-400">
                      {pricelist.is_active ? "Active" : "Archived"}
                    </span>
                    {pricelist.is_active && !isDefault ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-brand-muted hover:text-brand-navy"
                        disabled={isSettingDefault}
                        onClick={() => void handleSetDefault(pricelist)}
                      >
                        {isSettingDefault ? (
                          <Loader2
                            className="size-4 animate-spin"
                            aria-hidden="true"
                          />
                        ) : (
                          "Set default"
                        )}
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-brand-muted hover:text-brand-navy"
                      onClick={() => setEditingPricelist(pricelist)}
                    >
                      Update
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SettingsPanelSection>

      <AddPricelistDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreated={handleCreated}
      />

      {editingPricelist ? (
        <UpdatePricelistDialog
          pricelist={editingPricelist}
          isDefault={defaultPricelistUuid === editingPricelist.uuid}
          open={Boolean(editingPricelist)}
          onOpenChange={(open) => {
            if (!open) {
              setEditingPricelist(null);
            }
          }}
          onUpdated={handleUpdated}
          onArchived={handleArchived}
          onDefaultChanged={setDefaultPricelistUuid}
        />
      ) : null}
    </>
  );
}

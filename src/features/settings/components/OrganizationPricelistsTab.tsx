"use client";

import { Loader2, Star } from "lucide-react";
import { useEffect, useState } from "react";

import { PageLoader } from "@/components/page-loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddPricelistDialog } from "@/features/settings/components/AddPricelistDialog";
import { OrganizationEmptyState } from "@/features/settings/components/OrganizationEmptyState";
import { OrganizationTabSection } from "@/features/settings/components/OrganizationTabSection";
import { UpdatePricelistDialog } from "@/features/settings/components/UpdatePricelistDialog";
import {
  fetchOrganizationDefaultPricelist,
  fetchOrganizationPricelists,
  setOrganizationDefaultPricelist,
} from "@/features/settings/services/settings.service";
import type { OrganizationPricelist } from "@/features/settings/types/settings.types";
import { formatOdooRelation } from "@/features/sales-orders/utils/format-odoo-relation";
import { BffError } from "@/lib/bff-client";
import { formatBffErrorMessage } from "@/lib/bff-field-errors";
import { useToast } from "@/providers/toast-provider";

type OrganizationPricelistsTabProps = {
  isActive: boolean;
};

const columns = [
  { key: "name", label: "Pricelist" },
  { key: "id", label: "ERP ID" },
  { key: "currency", label: "Currency" },
  { key: "status", label: "Status" },
  { key: "actions", label: "" },
] as const;

export function OrganizationPricelistsTab({ isActive }: OrganizationPricelistsTabProps) {
  const { toast } = useToast();
  const [pricelists, setPricelists] = useState<OrganizationPricelist[]>([]);
  const [defaultPricelistId, setDefaultPricelistId] = useState<number | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<number | null>(null);
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
          setDefaultPricelistId(defaultResponse.default_pricelist_id);
        }
      } catch (loadError) {
        if (active) {
          setPricelists([]);
          setDefaultPricelistId(null);
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
        pricelist.id === updatedPricelist.id ? updatedPricelist : pricelist,
      ),
    );
  }

  function handleArchived(pricelistId: number) {
    setPricelists((current) =>
      current.map((pricelist) =>
        pricelist.id === pricelistId ? { ...pricelist, active: false } : pricelist,
      ),
    );
    if (defaultPricelistId === pricelistId) {
      setDefaultPricelistId(null);
    }
  }

  async function handleSetDefault(pricelist: OrganizationPricelist) {
    setSettingDefaultId(pricelist.id);

    try {
      const response = await setOrganizationDefaultPricelist({
        default_pricelist_id: pricelist.id,
      });
      setDefaultPricelistId(response.default_pricelist_id);
      toast({
        variant: "success",
        title: "Default pricelist updated",
        description: `${pricelist.name} is now the organization default.`,
      });
    } catch (error) {
      toast({
        variant: "error",
        title: "Could not set default pricelist",
        description:
          error instanceof BffError
            ? formatBffErrorMessage(error.message, error.errors)
            : error instanceof Error
              ? error.message
              : "Something went wrong.",
      });
    } finally {
      setSettingDefaultId(null);
    }
  }

  const isEmpty = !isLoading && !error && pricelists.length === 0;

  return (
    <>
      <OrganizationTabSection
        title="Pricelists"
        description="ERP pricelists used for cash billing and payer scheme tariffs."
        showHeader={!isEmpty}
        actions={
          pricelists.length > 0 ? (
            <Button onClick={() => setAddDialogOpen(true)}>Add pricelist</Button>
          ) : null
        }
      >
        {isLoading ? (
          <div className="py-16">
            <PageLoader />
          </div>
        ) : error ? (
          <p className="py-8 text-sm text-brand-muted">{error}</p>
        ) : pricelists.length === 0 ? (
          <OrganizationEmptyState
            message="No pricelists have been configured for this organization yet."
            actionLabel="Add pricelist"
            onAction={() => setAddDialogOpen(true)}
          />
        ) : (
          <div className="-mx-6 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-y border-brand-border bg-slate-50/60">
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-brand-muted"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {pricelists.map((pricelist) => {
                  const isDefault = defaultPricelistId === pricelist.id;
                  const isSettingDefault = settingDefaultId === pricelist.id;

                  return (
                    <tr key={pricelist.id}>
                      <td className="px-6 py-3.5 text-sm font-medium text-brand-navy">
                        <div className="flex flex-wrap items-center gap-2">
                          <span>{pricelist.name}</span>
                          {isDefault ? (
                            <Badge variant="outline" className="gap-1">
                              <Star
                                className="size-3 fill-current text-amber-500"
                                aria-hidden="true"
                              />
                              Default
                            </Badge>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-3.5 font-mono text-sm text-brand-navy">
                        {pricelist.id}
                      </td>
                      <td className="px-6 py-3.5 text-sm text-brand-navy">
                        {formatOdooRelation(pricelist.currency_id)}
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge variant={pricelist.active ? "default" : "outline"}>
                          {pricelist.active ? "Active" : "Archived"}
                        </Badge>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {pricelist.active && !isDefault ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 text-brand-muted hover:text-brand-navy"
                              disabled={isSettingDefault}
                              onClick={() => void handleSetDefault(pricelist)}
                            >
                              {isSettingDefault ? (
                                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </OrganizationTabSection>

      <AddPricelistDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreated={handleCreated}
      />

      {editingPricelist ? (
        <UpdatePricelistDialog
          pricelist={editingPricelist}
          isDefault={defaultPricelistId === editingPricelist.id}
          open={Boolean(editingPricelist)}
          onOpenChange={(open) => {
            if (!open) {
              setEditingPricelist(null);
            }
          }}
          onUpdated={handleUpdated}
          onArchived={handleArchived}
          onDefaultChanged={setDefaultPricelistId}
        />
      ) : null}
    </>
  );
}

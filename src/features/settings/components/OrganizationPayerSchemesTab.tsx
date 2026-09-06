"use client";

import { useEffect, useState } from "react";

import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import { Button } from "@/components/ui/button";
import { AddPayerSchemeDialog } from "@/features/settings/components/AddPayerSchemeDialog";
import { SettingsPanelSection } from "@/features/settings/components/SettingsPageLayout";
import { UpdatePayerSchemeStatusDialog } from "@/features/settings/components/UpdatePayerSchemeStatusDialog";
import {
  fetchOrganizationPayerSchemes,
  fetchOrganizationPayers,
} from "@/features/settings/services/settings.service";
import type {
  OrganizationPayer,
  OrganizationPayerScheme,
} from "@/features/settings/types/settings.types";

type OrganizationPayerSchemesTabProps = {
  isActive: boolean;
};

function schemeMeta(scheme: OrganizationPayerScheme) {
  return [scheme.insurance_company_name, scheme.code]
    .filter((value) => Boolean(value))
    .join(" · ");
}

export function OrganizationPayerSchemesTab({
  isActive,
}: OrganizationPayerSchemesTabProps) {
  const [payers, setPayers] = useState<OrganizationPayer[]>([]);
  const [schemes, setSchemes] = useState<OrganizationPayerScheme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [addSchemeDialogOpen, setAddSchemeDialogOpen] = useState(false);
  const [editingScheme, setEditingScheme] =
    useState<OrganizationPayerScheme | null>(null);

  const canAddScheme = payers.length > 0;

  useEffect(() => {
    if (!isActive) {
      return;
    }

    let active = true;

    async function loadSchemesData() {
      setIsLoading(true);
      setError(null);

      try {
        const [payersResponse, schemesResponse] = await Promise.all([
          fetchOrganizationPayers(),
          fetchOrganizationPayerSchemes(),
        ]);
        if (active) {
          setPayers(payersResponse.results);
          setSchemes(schemesResponse.results);
        }
      } catch (loadError) {
        if (active) {
          setPayers([]);
          setSchemes([]);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load payer schemes.",
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadSchemesData();

    return () => {
      active = false;
    };
  }, [isActive, reloadToken]);

  if (!isActive) {
    return null;
  }

  function handleReload() {
    setReloadToken((current) => current + 1);
  }

  function handleSchemeUpdated(updated: OrganizationPayerScheme) {
    setSchemes((current) =>
      current.map((scheme) =>
        scheme.uuid === updated.uuid ? { ...scheme, ...updated } : scheme,
      ),
    );
    setEditingScheme(null);
  }

  return (
    <>
      <SettingsPanelSection
        title="Payer schemes"
        description="Plans offered by each payer, including the tariff they use."
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canAddScheme}
            onClick={() => setAddSchemeDialogOpen(true)}
          >
            Add scheme
          </Button>
        }
      >
        {isLoading ? (
          <SettingsContentSkeleton rows={4} showHeader={false} />
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : schemes.length === 0 ? (
          <p className="text-sm text-slate-400">
            {canAddScheme
              ? "No schemes yet. Add a plan for a payer to use on visits and invoices."
              : "Add a payer before creating schemes."}
          </p>
        ) : (
          <ul className="divide-y divide-brand-border">
            {schemes.map((scheme) => {
              const meta = schemeMeta(scheme);

              return (
                <li
                  key={scheme.uuid}
                  className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-brand-navy">
                      {scheme.name}
                    </p>
                    {scheme.description ? (
                      <p className="mt-0.5 text-sm text-slate-400">
                        {scheme.description}
                      </p>
                    ) : null}
                    {meta ? (
                      <p className="mt-0.5 truncate text-sm text-slate-400">
                        {meta}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-slate-400">
                      {scheme.is_active ? "Active" : "Inactive"}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-brand-muted hover:text-brand-navy"
                      onClick={() => setEditingScheme(scheme)}
                      data-testid={`payer-scheme-update-${scheme.uuid}`}
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

      <AddPayerSchemeDialog
        open={addSchemeDialogOpen}
        onOpenChange={setAddSchemeDialogOpen}
        payers={payers}
        onCreated={handleReload}
      />

      <UpdatePayerSchemeStatusDialog
        scheme={editingScheme}
        open={editingScheme != null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingScheme(null);
          }
        }}
        onUpdated={handleSchemeUpdated}
      />
    </>
  );
}

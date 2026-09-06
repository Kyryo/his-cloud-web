"use client";

import { useEffect, useState } from "react";

import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import { Button } from "@/components/ui/button";
import { AddPayerDialog } from "@/features/settings/components/AddPayerDialog";
import { SettingsPanelSection } from "@/features/settings/components/SettingsPageLayout";
import { fetchOrganizationPayers } from "@/features/settings/services/settings.service";
import type { OrganizationPayer } from "@/features/settings/types/settings.types";

type OrganizationPayersTabProps = {
  isActive: boolean;
};

function payerMeta(payer: OrganizationPayer) {
  return [payer.code, payer.email, payer.phone_number]
    .filter((value) => Boolean(value))
    .join(" · ");
}

export function OrganizationPayersTab({ isActive }: OrganizationPayersTabProps) {
  const [payers, setPayers] = useState<OrganizationPayer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [addPayerDialogOpen, setAddPayerDialogOpen] = useState(false);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    let active = true;

    async function loadPayers() {
      setIsLoading(true);
      setError(null);

      try {
        const payersResponse = await fetchOrganizationPayers();
        if (active) {
          setPayers(payersResponse.results);
        }
      } catch (loadError) {
        if (active) {
          setPayers([]);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load payers.",
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadPayers();

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

  return (
    <>
      <SettingsPanelSection
        title="Payers"
        description="Insurance companies and funding partners used on invoices."
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAddPayerDialogOpen(true)}
          >
            Add payer
          </Button>
        }
      >
        {isLoading ? (
          <SettingsContentSkeleton rows={4} showHeader={false} />
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : payers.length === 0 ? (
          <p className="text-sm text-slate-400">
            No payers yet. Add an insurer or funding partner to start billing
            schemes.
          </p>
        ) : (
          <ul className="divide-y divide-brand-border">
            {payers.map((payer) => {
              const meta = payerMeta(payer);

              return (
                <li
                  key={payer.uuid}
                  className="flex items-start justify-between gap-4 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-brand-navy">
                      {payer.name}
                    </p>
                    {payer.description ? (
                      <p className="mt-0.5 text-sm text-slate-400">
                        {payer.description}
                      </p>
                    ) : null}
                    {meta ? (
                      <p className="mt-0.5 truncate text-sm text-slate-400">
                        {meta}
                      </p>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">
                    {payer.is_active ? "Active" : "Inactive"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </SettingsPanelSection>

      <AddPayerDialog
        open={addPayerDialogOpen}
        onOpenChange={setAddPayerDialogOpen}
        onCreated={handleReload}
      />
    </>
  );
}

"use client";

import { Link2, Link2Off } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/status-pill";
import { AddPayerDialog } from "@/features/settings/components/AddPayerDialog";
import { EditPayerDialog } from "@/features/settings/components/EditPayerDialog";
import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import { SettingsPanelSection } from "@/features/settings/components/SettingsPageLayout";
import { UpdatePayerStatusDialog } from "@/features/settings/components/UpdatePayerStatusDialog";
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

function PayerRegistryBadge({ payer }: { payer: OrganizationPayer }) {
  if (payer.registry_payer_detail) {
    return (
      <StatusPill
        label={payer.registry_payer_detail.display_name}
        variant="success"
        icon={Link2}
        className="shrink-0"
      />
    );
  }

  return (
    <StatusPill
      label="Not linked"
      variant="warning"
      icon={Link2Off}
      className="shrink-0"
    />
  );
}

export function OrganizationPayersTab({ isActive }: OrganizationPayersTabProps) {
  const [payers, setPayers] = useState<OrganizationPayer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [addPayerDialogOpen, setAddPayerDialogOpen] = useState(false);
  const [editingPayer, setEditingPayer] = useState<OrganizationPayer | null>(null);
  const [statusPayer, setStatusPayer] = useState<OrganizationPayer | null>(null);

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

  function handlePayerUpdated(updated: OrganizationPayer) {
    setPayers((current) =>
      current.map((payer) => (payer.uuid === updated.uuid ? updated : payer)),
    );
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
                  className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium text-brand-navy">
                        {payer.name}
                      </p>
                      <PayerRegistryBadge payer={payer} />
                    </div>
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
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-xs text-slate-400">
                      {payer.is_active ? "Active" : "Inactive"}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-brand-muted hover:text-brand-navy"
                      onClick={() => setEditingPayer(payer)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-brand-muted hover:text-brand-navy"
                      onClick={() => setStatusPayer(payer)}
                    >
                      {payer.is_active ? "Deactivate" : "Reactivate"}
                    </Button>
                  </div>
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

      <EditPayerDialog
        payer={editingPayer}
        open={Boolean(editingPayer)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingPayer(null);
          }
        }}
        onUpdated={handlePayerUpdated}
      />

      <UpdatePayerStatusDialog
        payer={statusPayer}
        open={Boolean(statusPayer)}
        onOpenChange={(open) => {
          if (!open) {
            setStatusPayer(null);
          }
        }}
        onUpdated={handlePayerUpdated}
      />
    </>
  );
}

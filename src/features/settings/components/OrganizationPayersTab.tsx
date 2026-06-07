"use client";

import { useEffect, useState } from "react";

import { PageLoader } from "@/components/page-loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddPayerDialog } from "@/features/settings/components/AddPayerDialog";
import { AddPayerSchemeDialog } from "@/features/settings/components/AddPayerSchemeDialog";
import { OrganizationEmptyState } from "@/features/settings/components/OrganizationEmptyState";
import { OrganizationTabToolbar } from "@/features/settings/components/OrganizationTabToolbar";
import {
  fetchOrganizationPayerSchemes,
  fetchOrganizationPayers,
} from "@/features/settings/services/settings.service";
import type {
  OrganizationPayer,
  OrganizationPayerScheme,
} from "@/features/settings/types/settings.types";

type OrganizationPayersTabProps = {
  isActive: boolean;
};

const payerColumns = [
  { key: "name", label: "Payer" },
  { key: "code", label: "Code" },
  { key: "contact", label: "Contact" },
  { key: "status", label: "Status" },
] as const;

const schemeColumns = [
  { key: "name", label: "Scheme" },
  { key: "payer", label: "Payer" },
  { key: "code", label: "Code" },
  { key: "status", label: "Status" },
] as const;

function formatContact(payer: OrganizationPayer) {
  if (!payer.email && !payer.phone_number) {
    return "—";
  }

  return (
    <div className="space-y-0.5">
      {payer.email ? (
        <div className="text-sm text-brand-navy">{payer.email}</div>
      ) : null}
      {payer.phone_number ? (
        <div className="text-xs text-brand-muted">{payer.phone_number}</div>
      ) : null}
    </div>
  );
}

export function OrganizationPayersTab({ isActive }: OrganizationPayersTabProps) {
  const [payers, setPayers] = useState<OrganizationPayer[]>([]);
  const [schemes, setSchemes] = useState<OrganizationPayerScheme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [addPayerDialogOpen, setAddPayerDialogOpen] = useState(false);
  const [addSchemeDialogOpen, setAddSchemeDialogOpen] = useState(false);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    let active = true;

    async function loadPayersAndSchemes() {
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
              : "Unable to load payers.",
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadPayersAndSchemes();

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
      {payers.length > 0 ? (
        <OrganizationTabToolbar>
          <Button onClick={() => setAddPayerDialogOpen(true)}>Add payer</Button>
        </OrganizationTabToolbar>
      ) : null}

      {isLoading ? (
        <div className="py-16">
          <PageLoader />
        </div>
      ) : error ? (
        <p className="py-8 text-sm text-brand-muted">{error}</p>
      ) : payers.length === 0 ? (
        <OrganizationEmptyState
          message="No payers have been configured for this organization yet."
          actionLabel="Add payer"
          onAction={() => setAddPayerDialogOpen(true)}
        />
      ) : (
        <div className="-mx-6 overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-y border-brand-border bg-slate-50/60">
                {payerColumns.map((column) => (
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
              {payers.map((payer) => (
                <tr key={payer.uuid}>
                  <td className="px-6 py-3.5">
                    <div className="text-sm font-medium text-brand-navy">{payer.name}</div>
                    {payer.description ? (
                      <div className="text-xs text-brand-muted">{payer.description}</div>
                    ) : null}
                  </td>
                  <td className="px-6 py-3.5 text-sm text-brand-navy">{payer.code || "—"}</td>
                  <td className="px-6 py-3.5">{formatContact(payer)}</td>
                  <td className="px-6 py-3.5">
                    <Badge variant={payer.is_active ? "default" : "outline"}>
                      {payer.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-10 border-t border-brand-border pt-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-brand-navy">Payer schemes</h3>
            <p className="text-sm text-brand-muted">
              Insurance schemes offered by your payers.
            </p>
          </div>
          {schemes.length > 0 || payers.length > 0 ? (
            <Button
              onClick={() => setAddSchemeDialogOpen(true)}
              disabled={payers.length === 0}
            >
              Add scheme
            </Button>
          ) : null}
        </div>

        {schemes.length === 0 ? (
          <OrganizationEmptyState
            message={
              payers.length === 0
                ? "Add a payer before creating payer schemes."
                : "No payer schemes have been configured for this organization yet."
            }
            actionLabel="Add scheme"
            actionDisabled={payers.length === 0}
            onAction={() => setAddSchemeDialogOpen(true)}
          />
        ) : (
          <div className="-mx-6 overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-y border-brand-border bg-slate-50/60">
                  {schemeColumns.map((column) => (
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
                {schemes.map((scheme) => (
                  <tr key={scheme.uuid}>
                    <td className="px-6 py-3.5">
                      <div className="text-sm font-medium text-brand-navy">{scheme.name}</div>
                      {scheme.description ? (
                        <div className="text-xs text-brand-muted">{scheme.description}</div>
                      ) : null}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-brand-navy">
                      {scheme.insurance_company_name}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-brand-navy">{scheme.code || "—"}</td>
                    <td className="px-6 py-3.5">
                      <Badge variant={scheme.is_active ? "default" : "outline"}>
                        {scheme.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddPayerDialog
        open={addPayerDialogOpen}
        onOpenChange={setAddPayerDialogOpen}
        onCreated={handleReload}
      />
      <AddPayerSchemeDialog
        open={addSchemeDialogOpen}
        onOpenChange={setAddSchemeDialogOpen}
        payers={payers}
        onCreated={handleReload}
      />
    </>
  );
}

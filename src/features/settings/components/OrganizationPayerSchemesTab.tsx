"use client";

import { useEffect, useState } from "react";

import { PageLoader } from "@/components/page-loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddPayerSchemeDialog } from "@/features/settings/components/AddPayerSchemeDialog";
import { OrganizationEmptyState } from "@/features/settings/components/OrganizationEmptyState";
import { OrganizationTabSection } from "@/features/settings/components/OrganizationTabSection";
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

const schemeColumns = [
  { key: "name", label: "Scheme" },
  { key: "payer", label: "Payer" },
  { key: "code", label: "Code" },
  { key: "status", label: "Status" },
] as const;

export function OrganizationPayerSchemesTab({
  isActive,
}: OrganizationPayerSchemesTabProps) {
  const [payers, setPayers] = useState<OrganizationPayer[]>([]);
  const [schemes, setSchemes] = useState<OrganizationPayerScheme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [addSchemeDialogOpen, setAddSchemeDialogOpen] = useState(false);

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

  const isEmpty = !isLoading && !error && schemes.length === 0;

  return (
    <>
      <OrganizationTabSection
        title="Payer schemes"
        description="Insurance schemes offered by your organization's payers."
        showHeader={!isEmpty}
        actions={
          schemes.length > 0 && canAddScheme ? (
            <Button onClick={() => setAddSchemeDialogOpen(true)}>Add scheme</Button>
          ) : null
        }
      >
        {isLoading ? (
          <div className="py-16">
            <PageLoader />
          </div>
        ) : error ? (
          <p className="py-8 text-sm text-brand-muted">{error}</p>
        ) : schemes.length === 0 ? (
          <OrganizationEmptyState
            message={
              canAddScheme
                ? "No payer schemes have been configured for this organization yet."
                : "Add a payer before creating payer schemes."
            }
            actionLabel="Add scheme"
            actionDisabled={!canAddScheme}
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
      </OrganizationTabSection>

      <AddPayerSchemeDialog
        open={addSchemeDialogOpen}
        onOpenChange={setAddSchemeDialogOpen}
        payers={payers}
        onCreated={handleReload}
      />
    </>
  );
}

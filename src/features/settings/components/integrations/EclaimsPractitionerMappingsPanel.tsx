"use client";

import { Loader2, Pencil, Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { PrimaryButton, SecondaryButton } from "@/components/ui/app-buttons";
import { EclaimsPractitionerMappingDialog } from "@/features/settings/components/integrations/EclaimsPractitionerMappingDialog";
import { fetchEClaimPractitionerMappings } from "@/features/claims/services/claims.service";
import type { EClaimPractitionerMapping } from "@/features/claims/types/claims.types";
import { fetchInsuranceSchemes } from "@/features/customers/services/insurance-schemes.service";
import type { InsuranceScheme } from "@/features/customers/types/customer-insurance.types";
import { fetchOrganizationClinics } from "@/features/settings/services/settings.service";
import type { OrganizationClinic } from "@/features/settings/types/settings.types";
import { coerceToOptionalString } from "@/lib/coerce-string";

type EclaimsPractitionerMappingsPanelProps = {
  className?: string;
};

function formatSchemeLabel(
  schemeId: number | null,
  schemes: InsuranceScheme[],
): string {
  if (schemeId == null) {
    return "—";
  }

  const scheme = schemes.find((item) => item.id === schemeId);
  if (!scheme) {
    return String(schemeId);
  }

  return `${scheme.name} · ${scheme.insurance_company_name}`;
}

export function EclaimsPractitionerMappingsPanel({
  className,
}: EclaimsPractitionerMappingsPanelProps) {
  const [mappings, setMappings] = useState<EClaimPractitionerMapping[]>([]);
  const [clinics, setClinics] = useState<OrganizationClinic[]>([]);
  const [insuranceSchemes, setInsuranceSchemes] = useState<InsuranceScheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<EClaimPractitionerMapping | null>(
    null,
  );

  async function loadData() {
    setIsLoading(true);
    setError(null);
    try {
      const [mappingResponse, clinicResponse, schemes] = await Promise.all([
        fetchEClaimPractitionerMappings(),
        fetchOrganizationClinics(),
        fetchInsuranceSchemes(),
      ]);
      setMappings(mappingResponse.results);
      setClinics(clinicResponse.results);
      setInsuranceSchemes(schemes);
    } catch (loadError) {
      setMappings([]);
      setClinics([]);
      setInsuranceSchemes([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load practitioner mappings.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const [mappingResponse, clinicResponse, schemes] = await Promise.all([
          fetchEClaimPractitionerMappings(),
          fetchOrganizationClinics(),
          fetchInsuranceSchemes(),
        ]);
        if (cancelled) {
          return;
        }
        setMappings(mappingResponse.results);
        setClinics(clinicResponse.results);
        setInsuranceSchemes(schemes);
        setError(null);
      } catch (loadError) {
        if (cancelled) {
          return;
        }
        setMappings([]);
        setClinics([]);
        setInsuranceSchemes([]);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load practitioner mappings.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  function openCreateDialog() {
    setEditingMapping(null);
    setDialogOpen(true);
  }

  function openEditDialog(mapping: EClaimPractitionerMapping) {
    setEditingMapping(mapping);
    setDialogOpen(true);
  }

  function handleSaved(mapping: EClaimPractitionerMapping) {
    setMappings((current) => {
      const index = current.findIndex((item) => item.id === mapping.id);
      if (index >= 0) {
        const next = [...current];
        next[index] = mapping;
        return next;
      }
      return [mapping, ...current];
    });
  }

  if (isLoading) {
    return (
      <div className={className}>
        <div className="flex items-center gap-2 py-8 text-sm text-brand-muted">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading practitioner mappings...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
        <SecondaryButton type="button" className="mt-4" onClick={() => void loadData()}>
          Retry
        </SecondaryButton>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-brand-navy">Practitioner mappings</h2>
          <p className="mt-1 text-sm text-brand-muted">
            Link clinics and insurance schemes to payer-specific provider and practitioner
            numbers used during claim submission.
          </p>
        </div>
        {mappings.length > 0 ? (
          <PrimaryButton type="button" onClick={openCreateDialog}>
            <Plus className="size-4" aria-hidden="true" />
            Add mapping
          </PrimaryButton>
        ) : null}
      </div>

      {mappings.length === 0 ? (
        <div className="mt-6 py-8 text-center">
          <p className="text-sm text-brand-muted">No practitioner mappings configured yet.</p>
          <PrimaryButton type="button" className="mt-4" onClick={openCreateDialog}>
            <Plus className="size-4" aria-hidden="true" />
            Add your first mapping
          </PrimaryButton>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-brand-border">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-brand-muted">
                  Clinic
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-brand-muted">
                  Scheme
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-brand-muted">
                  Practitioner
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-brand-muted">
                  Provider code
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-brand-muted">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border bg-white">
              {mappings.map((mapping) => (
                <tr key={mapping.uuid}>
                  <td className="px-4 py-3 text-sm text-brand-navy">
                    {clinics.find((clinic) => clinic.id === mapping.clinic)?.name ??
                      mapping.clinic}
                  </td>
                  <td className="px-4 py-3 text-sm text-brand-muted">
                    {formatSchemeLabel(mapping.insurance_scheme, insuranceSchemes)}
                  </td>
                  <td className="px-4 py-3 text-sm text-brand-navy">
                    {mapping.practitioner_number}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-brand-navy">
                    {coerceToOptionalString(mapping.service_provider_code) || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <SecondaryButton
                      type="button"
                      className="h-8 px-2"
                      onClick={() => openEditDialog(mapping)}
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                      Edit
                    </SecondaryButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <EclaimsPractitionerMappingDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        clinics={clinics}
        insuranceSchemes={insuranceSchemes}
        mapping={editingMapping}
        defaultClinicId={clinics[0]?.id}
        onSaved={handleSaved}
      />
    </div>
  );
}

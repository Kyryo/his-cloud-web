"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import { EclaimsPractitionerMappingDialog } from "@/features/settings/components/integrations/EclaimsPractitionerMappingDialog";
import {
  OrganizationClinicGroup,
  OrganizationEntityRow,
  groupByClinicName,
} from "@/features/settings/components/OrganizationTabContent";
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

function mappingMeta(mapping: EClaimPractitionerMapping) {
  const providerCode =
    coerceToOptionalString(mapping.service_provider_code) || "No provider code";

  return `${mapping.practitioner_number} · ${providerCode}`;
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
  const [editingMapping, setEditingMapping] =
    useState<EClaimPractitionerMapping | null>(null);

  const clinicNameById = useMemo(
    () => new Map(clinics.map((clinic) => [clinic.id, clinic.name])),
    [clinics],
  );

  const clinicGroups = useMemo(
    () =>
      groupByClinicName(
        mappings,
        (mapping) => clinicNameById.get(mapping.clinic) ?? `Clinic ${mapping.clinic}`,
      ),
    [clinicNameById, mappings],
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

  return (
    <div className={className}>
      <div className="flex items-start justify-between gap-4">
        <p className="max-w-xl text-sm text-slate-400">
          Link clinics and insurance schemes to payer provider and practitioner
          numbers used when submitting claims.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openCreateDialog}
        >
          Add mapping
        </Button>
      </div>

      <div className="mt-5">
        {isLoading ? (
          <SettingsContentSkeleton rows={4} showHeader={false} />
        ) : error ? (
          <div className="space-y-3">
            <p className="text-sm text-red-600">{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadData()}
            >
              Retry
            </Button>
          </div>
        ) : mappings.length === 0 ? (
          <p className="text-sm text-slate-400">
            No practitioner mappings yet. Add a mapping to connect a clinic and
            scheme to MASM identifiers.
          </p>
        ) : (
          <div className="space-y-6">
            {clinicGroups.map((group) => (
              <OrganizationClinicGroup
                key={group.clinicName}
                title={group.clinicName}
                count={group.items.length}
              >
                {group.items.map((mapping) => (
                  <OrganizationEntityRow
                    key={mapping.uuid}
                    title={formatSchemeLabel(
                      mapping.insurance_scheme,
                      insuranceSchemes,
                    )}
                    meta={mappingMeta(mapping)}
                    status={mapping.is_active ? "Active" : "Inactive"}
                    actions={
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-brand-muted hover:text-brand-navy"
                        onClick={() => {
                          setEditingMapping(mapping);
                          setDialogOpen(true);
                        }}
                      >
                        Update
                      </Button>
                    }
                  />
                ))}
              </OrganizationClinicGroup>
            ))}
          </div>
        )}
      </div>

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

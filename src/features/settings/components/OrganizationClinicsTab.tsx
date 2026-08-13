"use client";

import { useEffect, useState } from "react";

import { PageLoader } from "@/components/page-loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddClinicDialog } from "@/features/settings/components/AddClinicDialog";
import { OrganizationEmptyState } from "@/features/settings/components/OrganizationEmptyState";
import { OrganizationTabSection } from "@/features/settings/components/OrganizationTabSection";
import { UpdateClinicDialog } from "@/features/settings/components/UpdateClinicDialog";
import {
  fetchOrganization,
  fetchOrganizationClinics,
} from "@/features/settings/services/settings.service";
import type { OrganizationClinic } from "@/features/settings/types/settings.types";

type OrganizationClinicsTabProps = {
  isActive: boolean;
};

const columns = [
  { key: "name", label: "Clinic" },
  { key: "code", label: "Code" },
  { key: "locations", label: "Locations" },
  { key: "hours", label: "Hours" },
  { key: "status", label: "Status" },
  { key: "actions", label: "" },
] as const;

function formatStatus(status: string, isActive: boolean) {
  const label = status.replace(/_/g, " ");
  return (
    <Badge variant={isActive ? "default" : "outline"} className="capitalize">
      {label.toLowerCase()}
    </Badge>
  );
}

export function OrganizationClinicsTab({ isActive }: OrganizationClinicsTabProps) {
  const [clinics, setClinics] = useState<OrganizationClinic[]>([]);
  const [maxClinics, setMaxClinics] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<OrganizationClinic | null>(null);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    let active = true;

    async function loadClinics() {
      setIsLoading(true);
      setError(null);

      try {
        const [organization, response] = await Promise.all([
          fetchOrganization(),
          fetchOrganizationClinics(),
        ]);
        if (active) {
          setClinics(response.results);
          setMaxClinics(organization.max_clinics);
        }
      } catch (loadError) {
        if (active) {
          setClinics([]);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load clinics.",
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadClinics();

    return () => {
      active = false;
    };
  }, [isActive, reloadToken]);

  if (!isActive) {
    return null;
  }

  function handleUpdated(updatedClinic: OrganizationClinic) {
    setClinics((current) =>
      current.map((clinic) =>
        clinic.uuid === updatedClinic.uuid ? updatedClinic : clinic,
      ),
    );
  }

  function handleCreated(clinic: OrganizationClinic) {
    setClinics((current) =>
      [...current, clinic].sort((left, right) => left.name.localeCompare(right.name)),
    );
    setReloadToken((token) => token + 1);
  }

  const atClinicLimit = clinics.length >= maxClinics;
  const limitMessage = `Clinic limit reached (${clinics.length}/${maxClinics}). Contact support to increase.`;
  const isEmpty = !isLoading && !error && clinics.length === 0;

  return (
    <>
      <OrganizationTabSection
        title="Clinics"
        description="Configure the clinics within your organization."
        showHeader={!isEmpty}
        actions={
          isEmpty ? null : (
            <div className="flex flex-col items-end gap-1">
              <Button
                type="button"
                onClick={() => setAddDialogOpen(true)}
                disabled={atClinicLimit}
              >
                Add clinic
              </Button>
              {atClinicLimit ? (
                <p className="max-w-xs text-right text-xs text-brand-muted">
                  {limitMessage}
                </p>
              ) : (
                <p className="text-xs text-brand-muted">
                  {clinics.length}/{maxClinics} clinics used
                </p>
              )}
            </div>
          )
        }
      >
        {isLoading ? (
          <div className="py-16">
            <PageLoader />
          </div>
        ) : error ? (
          <p className="py-8 text-sm text-brand-muted">{error}</p>
        ) : isEmpty ? (
          <OrganizationEmptyState
            message="No clinics have been set up for this organization yet."
            actionLabel="Add clinic"
            onAction={() => setAddDialogOpen(true)}
            actionDisabled={atClinicLimit}
          >
            {atClinicLimit ? (
              <p className="mt-3 text-xs text-brand-muted">{limitMessage}</p>
            ) : null}
          </OrganizationEmptyState>
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
                {clinics.map((clinic) => (
                  <tr key={clinic.uuid}>
                    <td className="px-6 py-3.5 text-sm font-medium text-brand-navy">
                      {clinic.name}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-brand-navy">{clinic.code}</td>
                    <td className="px-6 py-3.5 text-sm text-brand-navy">
                      {clinic.location_count}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-brand-muted">
                      {clinic.operating_hours_display || "—"}
                    </td>
                    <td className="px-6 py-3.5">
                      {formatStatus(clinic.status, clinic.is_active)}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-brand-muted hover:text-brand-navy"
                        onClick={() => setEditingClinic(clinic)}
                      >
                        Update
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </OrganizationTabSection>

      <AddClinicDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreated={handleCreated}
      />

      {editingClinic ? (
        <UpdateClinicDialog
          clinic={editingClinic}
          open={Boolean(editingClinic)}
          onOpenChange={(open) => {
            if (!open) {
              setEditingClinic(null);
            }
          }}
          onUpdated={handleUpdated}
        />
      ) : null}
    </>
  );
}

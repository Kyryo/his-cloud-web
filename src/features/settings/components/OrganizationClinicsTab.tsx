"use client";

import { useEffect, useState } from "react";

import { PageLoader } from "@/components/page-loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrganizationTabSection } from "@/features/settings/components/OrganizationTabSection";
import { UpdateClinicDialog } from "@/features/settings/components/UpdateClinicDialog";
import { fetchOrganizationClinics } from "@/features/settings/services/settings.service";
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [editingClinic, setEditingClinic] = useState<OrganizationClinic | null>(null);

  useEffect(() => {
    if (!isActive || hasLoaded) {
      return;
    }

    let active = true;

    async function loadClinics() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchOrganizationClinics();
        if (active) {
          setClinics(response.results);
          setHasLoaded(true);
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
  }, [hasLoaded, isActive]);

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

  const isEmpty = !isLoading && !error && clinics.length === 0;

  return (
    <>
      <OrganizationTabSection
        title="Clinics"
        description="Configure the healthcare facilities that belong to your organization."
        showHeader={!isEmpty}
      >
        {isLoading ? (
          <div className="py-16">
            <PageLoader />
          </div>
        ) : error ? (
          <p className="py-8 text-sm text-brand-muted">{error}</p>
        ) : clinics.length === 0 ? (
          <p className="py-12 text-center text-sm text-brand-muted">
            No clinics have been set up for this organization yet.
          </p>
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

"use client";

import { useEffect, useState } from "react";

import { PageLoader } from "@/components/page-loader";
import { Badge } from "@/components/ui/badge";
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

  if (isLoading) {
    return (
      <div className="py-16">
        <PageLoader />
      </div>
    );
  }

  if (error) {
    return <p className="py-8 text-sm text-brand-muted">{error}</p>;
  }

  if (clinics.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-brand-muted">
        No clinics have been set up for this organization yet.
      </p>
    );
  }

  return (
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
              <td className="px-6 py-3.5">{formatStatus(clinic.status, clinic.is_active)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

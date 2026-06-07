"use client";

import { useEffect, useState } from "react";

import { PageLoader } from "@/components/page-loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddServiceDialog } from "@/features/settings/components/AddServiceDialog";
import { OrganizationEmptyState } from "@/features/settings/components/OrganizationEmptyState";
import { OrganizationTabToolbar } from "@/features/settings/components/OrganizationTabToolbar";
import { fetchOrganizationServices } from "@/features/settings/services/settings.service";
import type { OrganizationService } from "@/features/settings/types/settings.types";

type OrganizationServicesTabProps = {
  isActive: boolean;
};

const columns = [
  { key: "name", label: "Service" },
  { key: "code", label: "Code" },
  { key: "type", label: "Type" },
  { key: "status", label: "Status" },
] as const;

function formatServiceType(service: OrganizationService) {
  const labels = [
    service.is_consultation_visit ? "Consultation" : null,
    service.is_dentist_visit ? "Dental" : null,
    service.is_walk_in_visit ? "Walk-in" : null,
  ].filter(Boolean);

  if (labels.length === 0) {
    return "—";
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {labels.map((label) => (
        <Badge key={label} variant="secondary">
          {label}
        </Badge>
      ))}
    </div>
  );
}

export function OrganizationServicesTab({ isActive }: OrganizationServicesTabProps) {
  const [services, setServices] = useState<OrganizationService[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    let active = true;

    async function loadServices() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchOrganizationServices();
        if (active) {
          setServices(response.results);
        }
      } catch (loadError) {
        if (active) {
          setServices([]);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load services.",
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadServices();

    return () => {
      active = false;
    };
  }, [isActive, reloadToken]);

  if (!isActive) {
    return null;
  }

  function handleCreated(_service: OrganizationService) {
    setReloadToken((current) => current + 1);
  }

  return (
    <>
      {services.length > 0 ? (
        <OrganizationTabToolbar>
          <Button onClick={() => setAddDialogOpen(true)}>Add service</Button>
        </OrganizationTabToolbar>
      ) : null}

      {isLoading ? (
        <div className="py-16">
          <PageLoader />
        </div>
      ) : error ? (
        <p className="py-8 text-sm text-brand-muted">{error}</p>
      ) : services.length === 0 ? (
        <OrganizationEmptyState
          message="No services have been configured for this organization yet."
          actionLabel="Add service"
          onAction={() => setAddDialogOpen(true)}
        />
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
              {services.map((service) => (
                <tr key={service.uuid}>
                  <td className="px-6 py-3.5">
                    <div className="text-sm font-medium text-brand-navy">{service.name}</div>
                    {service.description ? (
                      <div className="text-xs text-brand-muted">{service.description}</div>
                    ) : null}
                  </td>
                  <td className="px-6 py-3.5 text-sm text-brand-navy">
                    {service.code || "—"}
                  </td>
                  <td className="px-6 py-3.5">{formatServiceType(service)}</td>
                  <td className="px-6 py-3.5">
                    <Badge variant={service.is_active ? "default" : "outline"}>
                      {service.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddServiceDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreated={handleCreated}
      />
    </>
  );
}

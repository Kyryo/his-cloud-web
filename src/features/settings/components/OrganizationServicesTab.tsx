"use client";

import { useEffect, useState } from "react";

import { PageLoader } from "@/components/page-loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddServiceDialog } from "@/features/settings/components/AddServiceDialog";
import { OrganizationEmptyState } from "@/features/settings/components/OrganizationEmptyState";
import { OrganizationTabSection } from "@/features/settings/components/OrganizationTabSection";
import { UpdateServiceDialog } from "@/features/settings/components/UpdateServiceDialog";
import { fetchOrganizationServices } from "@/features/settings/services/settings.service";
import type { OrganizationService } from "@/features/settings/types/settings.types";

type OrganizationServicesTabProps = {
  isActive: boolean;
};

const columns = [
  { key: "name", label: "Consultation service" },
  { key: "code", label: "Code" },
  { key: "type", label: "Type" },
  { key: "status", label: "Status" },
  { key: "actions", label: "" },
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
  const [editingService, setEditingService] = useState<OrganizationService | null>(null);

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
              : "Unable to load consultation services.",
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

  function handleUpdated(updatedService: OrganizationService) {
    setServices((current) =>
      current.map((service) =>
        service.uuid === updatedService.uuid ? updatedService : service,
      ),
    );
  }

  const isEmpty = !isLoading && !error && services.length === 0;

  return (
    <>
      <OrganizationTabSection
        title="Consultation Services"
        description="Define the consultation services available at your clinic, such as GP consultations."
        showHeader={!isEmpty}
        actions={
          services.length > 0 ? (
            <Button onClick={() => setAddDialogOpen(true)}>
              Add service
            </Button>
          ) : null
        }
      >
        {isLoading ? (
          <div className="py-16">
            <PageLoader />
          </div>
        ) : error ? (
          <p className="py-8 text-sm text-brand-muted">{error}</p>
        ) : services.length === 0 ? (
          <OrganizationEmptyState
            message="No consultation services have been configured for this organization yet."
            actionLabel="Add consultation service"
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
                    <td className="px-6 py-3.5 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-brand-muted hover:text-brand-navy"
                        onClick={() => setEditingService(service)}
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

      <AddServiceDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreated={handleCreated}
      />

      {editingService ? (
        <UpdateServiceDialog
          service={editingService}
          open={Boolean(editingService)}
          onOpenChange={(open) => {
            if (!open) {
              setEditingService(null);
            }
          }}
          onUpdated={handleUpdated}
        />
      ) : null}
    </>
  );
}

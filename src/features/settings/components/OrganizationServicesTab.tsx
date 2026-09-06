"use client";

import { useEffect, useState } from "react";

import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import { Button } from "@/components/ui/button";
import { AddServiceDialog } from "@/features/settings/components/AddServiceDialog";
import { SettingsPanelSection } from "@/features/settings/components/SettingsPageLayout";
import { UpdateServiceDialog } from "@/features/settings/components/UpdateServiceDialog";
import { fetchOrganizationServices } from "@/features/settings/services/settings.service";
import type { OrganizationService } from "@/features/settings/types/settings.types";

type OrganizationServicesTabProps = {
  isActive: boolean;
};

function serviceMeta(service: OrganizationService) {
  return [
    service.code,
    service.is_chargable ? "Chargeable" : "Non-chargeable",
  ]
    .filter((value) => Boolean(value))
    .join(" · ");
}

export function OrganizationServicesTab({
  isActive,
}: OrganizationServicesTabProps) {
  const [services, setServices] = useState<OrganizationService[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingService, setEditingService] =
    useState<OrganizationService | null>(null);

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

  return (
    <>
      <SettingsPanelSection
        title="Consultation services"
        description="Services staff pick when registering a visit, such as GP consultations."
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAddDialogOpen(true)}
          >
            Add service
          </Button>
        }
      >
        {isLoading ? (
          <SettingsContentSkeleton rows={4} showHeader={false} />
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : services.length === 0 ? (
          <p className="text-sm text-slate-400">
            No consultation services yet. Add one so staff can register visits.
          </p>
        ) : (
          <ul className="divide-y divide-brand-border">
            {services.map((service) => {
              const meta = serviceMeta(service);

              return (
                <li
                  key={service.uuid}
                  className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-brand-navy">
                      {service.name}
                    </p>
                    {service.description ? (
                      <p className="mt-0.5 text-sm text-slate-400">
                        {service.description}
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
                      {service.is_active ? "Active" : "Inactive"}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-brand-muted hover:text-brand-navy"
                      onClick={() => setEditingService(service)}
                    >
                      Update
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </SettingsPanelSection>

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

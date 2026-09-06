"use client";

import { useEffect, useState } from "react";

import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import { Button } from "@/components/ui/button";
import { AddClinicDialog } from "@/features/settings/components/AddClinicDialog";
import {
  OrganizationEntityRow,
  OrganizationTabPanel,
} from "@/features/settings/components/OrganizationTabContent";
import { UpdateClinicDialog } from "@/features/settings/components/UpdateClinicDialog";
import {
  fetchOrganization,
  fetchOrganizationClinics,
} from "@/features/settings/services/settings.service";
import type { OrganizationClinic } from "@/features/settings/types/settings.types";

type OrganizationClinicsTabProps = {
  isActive: boolean;
};

function clinicMeta(clinic: OrganizationClinic) {
  const locationLabel =
    clinic.location_count === 1
      ? "1 location"
      : `${clinic.location_count} locations`;

  return [clinic.code, locationLabel, clinic.operating_hours_display]
    .filter((value) => Boolean(value))
    .join(" · ");
}

export function OrganizationClinicsTab({ isActive }: OrganizationClinicsTabProps) {
  const [clinics, setClinics] = useState<OrganizationClinic[]>([]);
  const [maxClinics, setMaxClinics] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<OrganizationClinic | null>(
    null,
  );

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
      [...current, clinic].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    setReloadToken((token) => token + 1);
  }

  const atClinicLimit = clinics.length >= maxClinics;
  const limitMessage = `Clinic limit reached (${clinics.length}/${maxClinics}). Contact support to increase.`;

  return (
    <>
      <OrganizationTabPanel
        description="Sites where your teams work. Departments and locations belong to a clinic."
        action={
          <div className="flex flex-col items-end gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAddDialogOpen(true)}
              disabled={atClinicLimit}
            >
              Add clinic
            </Button>
            {atClinicLimit ? (
              <p className="max-w-xs text-right text-xs text-slate-400">
                {limitMessage}
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                {clinics.length}/{maxClinics} clinics used
              </p>
            )}
          </div>
        }
      >
        {isLoading ? (
          <SettingsContentSkeleton rows={4} showHeader={false} />
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : clinics.length === 0 ? (
          <p className="text-sm text-slate-400">
            No clinics yet. Add a clinic to start configuring departments and
            locations.
          </p>
        ) : (
          <ul className="divide-y divide-brand-border">
            {clinics.map((clinic) => (
              <OrganizationEntityRow
                key={clinic.uuid}
                title={clinic.name}
                meta={clinicMeta(clinic)}
                status={clinic.is_active ? "Active" : "Inactive"}
                actions={
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-brand-muted hover:text-brand-navy"
                    onClick={() => setEditingClinic(clinic)}
                  >
                    Update
                  </Button>
                }
              />
            ))}
          </ul>
        )}
      </OrganizationTabPanel>

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

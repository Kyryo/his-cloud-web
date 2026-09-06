"use client";

import { useEffect, useMemo, useState } from "react";

import { SettingsContentSkeleton } from "@/features/settings/components/SettingsContentSkeleton";
import { Button } from "@/components/ui/button";
import { AddLocationDialog } from "@/features/settings/components/AddLocationDialog";
import {
  OrganizationClinicGroup,
  OrganizationEntityRow,
  OrganizationTabPanel,
  groupByClinicName,
} from "@/features/settings/components/OrganizationTabContent";
import { UpdateLocationDialog } from "@/features/settings/components/UpdateLocationDialog";
import { fetchOrganizationLocations } from "@/features/settings/services/settings.service";
import type { OrganizationLocation } from "@/features/settings/types/settings.types";

type OrganizationLocationsTabProps = {
  isActive: boolean;
};

function locationMeta(location: OrganizationLocation) {
  return [
    location.code,
    location.department_name,
    location.operating_hours_display,
  ]
    .filter((value) => Boolean(value))
    .join(" · ");
}

export function OrganizationLocationsTab({
  isActive,
}: OrganizationLocationsTabProps) {
  const [locations, setLocations] = useState<OrganizationLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] =
    useState<OrganizationLocation | null>(null);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    let active = true;

    async function loadLocations() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetchOrganizationLocations();
        if (active) {
          setLocations(response.results);
        }
      } catch (loadError) {
        if (active) {
          setLocations([]);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load locations.",
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadLocations();

    return () => {
      active = false;
    };
  }, [isActive, reloadToken]);

  const clinicGroups = useMemo(
    () => groupByClinicName(locations, (location) => location.clinic_name),
    [locations],
  );

  if (!isActive) {
    return null;
  }

  function handleCreated(_location: OrganizationLocation) {
    setReloadToken((current) => current + 1);
  }

  function handleUpdated(updatedLocation: OrganizationLocation) {
    setLocations((current) =>
      current.map((location) =>
        location.uuid === updatedLocation.uuid ? updatedLocation : location,
      ),
    );
  }

  return (
    <>
      <OrganizationTabPanel
        description="Rooms and stores where care is delivered or stock is held."
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAddDialogOpen(true)}
          >
            Add location
          </Button>
        }
      >
        {isLoading ? (
          <SettingsContentSkeleton rows={4} showHeader={false} />
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : locations.length === 0 ? (
          <p className="text-sm text-slate-400">
            No locations yet. Add a place such as a pharmacy or consulting room.
          </p>
        ) : (
          <div className="space-y-7">
            {clinicGroups.map((group) => (
              <OrganizationClinicGroup
                key={group.clinicName}
                title={group.clinicName}
                count={group.items.length}
              >
                {group.items.map((location) => (
                  <OrganizationEntityRow
                    key={location.uuid}
                    title={location.name}
                    meta={locationMeta(location)}
                    status={location.is_active ? "Active" : "Inactive"}
                    actions={
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 text-brand-muted hover:text-brand-navy"
                        onClick={() => setEditingLocation(location)}
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
      </OrganizationTabPanel>

      <AddLocationDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreated={handleCreated}
      />

      {editingLocation ? (
        <UpdateLocationDialog
          location={editingLocation}
          open={Boolean(editingLocation)}
          onOpenChange={(open) => {
            if (!open) {
              setEditingLocation(null);
            }
          }}
          onUpdated={handleUpdated}
        />
      ) : null}
    </>
  );
}
